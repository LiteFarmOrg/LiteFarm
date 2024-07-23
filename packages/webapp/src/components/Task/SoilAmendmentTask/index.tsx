/*
 *  Copyright 2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import {
  useGetSoilAmendmentMethodsQuery,
  useGetSoilAmendmentPurposesQuery,
  useGetSoilAmendmentFertiliserTypesQuery,
  useAddSoilAmendmentProductMutation,
  useUpdateSoilAmendmentProductMutation,
} from '../../../store/api/apiSlice';
import ReactSelect from '../../Form/ReactSelect';
import Input from '../../Form/Input';
import Unit from '../../Form/Unit';
import AddSoilAmendmentProducts from '../AddSoilAmendmentProducts';
import { type ProductCardProps } from '../AddSoilAmendmentProducts/ProductCard';
import { isNewProduct } from '../AddSoilAmendmentProducts/ProductCard/ProductDetails';
import {
  enqueueErrorSnackbar,
  enqueueSuccessSnackbar,
} from '../../../containers/Snackbar/snackbarSlice';
import type { ProductFormFields, ProductId } from '../AddSoilAmendmentProducts/types';
import { MolecularCompound, Nutrients, TASK_FIELD_NAMES } from '../AddSoilAmendmentProducts/types';
import type { SoilAmendmentProduct } from '../../../store/api/types';
import { getProducts } from '../../../containers/Task/saga';
import { TASK_TYPES } from '../../../containers/Task/constants';
import { furrow_hole_depth } from '../../../util/convert-units/unit';
import styles from './styles.module.scss';
import { locationsSelector } from '../../../containers/locationSlice';

type PureSoilAmendmentTaskProps = UseFormReturn &
  Pick<ProductCardProps, 'farm' | 'system' | 'products'> & {
    disabled: boolean;
    task?: { locations: { location_id: number }[] };
    locations: { location_id: number }[];
  };

const hasNoValue = (
  keys: (Nutrients | MolecularCompound)[],
  object: Omit<SoilAmendmentProduct['soil_amendment_product'], 'product_id' | 'name'>,
): boolean => {
  return keys.every((item) => !object[item] && object[item] !== 0);
};

const PureSoilAmendmentTask = ({
  farm,
  system,
  products = [],
  disabled = false,
  ...props
}: PureSoilAmendmentTaskProps) => {
  const { control, register, setValue, getValues, watch } = props;

  const { t } = useTranslation(['translation', 'message']);
  const dispatch = useDispatch();

  const { task, locations: propLocations } = props;
  const taskLocationIds = (task?.locations || propLocations)?.map(({ location_id }) => location_id);
  const locations = useSelector(locationsSelector).filter(({ location_id }) =>
    taskLocationIds?.includes(location_id),
  );

  const { data: methods = [] } = useGetSoilAmendmentMethodsQuery();
  const { data: purposes = [] } = useGetSoilAmendmentPurposesQuery();
  const { data: fertiliserTypes = [] } = useGetSoilAmendmentFertiliserTypesQuery();
  const [addProduct] = useAddSoilAmendmentProductMutation();
  const [updateProduct] = useUpdateSoilAmendmentProductMutation();

  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.BROADCAST')
  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.BANDED')
  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.FURROW_HOLE')
  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.SIDE_DRESS')
  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.FERTIGATION')
  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.FOLIAR')
  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER')
  const methodsOptions = methods.map(({ id, key }) => {
    return { value: id, label: t(`ADD_TASK.SOIL_AMENDMENT_VIEW.${key}`) };
  });

  const METHOD_ID = `soil_amendment_task.${TASK_FIELD_NAMES.METHOD_ID}`;
  const FURROW_HOLE_DEPTH = `soil_amendment_task.${TASK_FIELD_NAMES.FURROW_HOLE_DEPTH}`;
  const FURROW_HOLE_DEPTH_UNIT = `soil_amendment_task.${TASK_FIELD_NAMES.FURROW_HOLE_DEPTH_UNIT}`;
  const OTHER_APPLICATION_METHOD = `soil_amendment_task.${TASK_FIELD_NAMES.OTHER_APPLICATION_METHOD}`;

  const methodId = watch(METHOD_ID) as number;
  const methodIdsMap = methods.reduce<{ [key: string]: number }>((acc, currentValue) => {
    return { ...acc, [currentValue.key]: currentValue.id };
  }, {});

  const onSaveProduct = async (
    data: ProductFormFields & { product_id: ProductId },
    callback: (product_id: ProductId) => void = () => ({}),
  ) => {
    const { product_id, supplier, on_permitted_substances_list, composition, ...body } = data;
    const isNew = isNewProduct(product_id);
    delete body.dry_matter_content;

    const formattedData = {
      type: TASK_TYPES.SOIL_AMENDMENT,
      supplier,
      on_permitted_substances_list,
      soil_amendment_product: { ...body, ...composition },
      [isNew ? 'name' : 'product_id']: product_id,
    };

    if (hasNoValue(Object.values(Nutrients), formattedData.soil_amendment_product)) {
      delete formattedData.soil_amendment_product.elemental_unit;
    }
    if (hasNoValue(Object.values(MolecularCompound), formattedData.soil_amendment_product)) {
      delete formattedData.soil_amendment_product.molecular_compounds_unit;
    }

    let result;

    try {
      result = await (isNew ? addProduct : updateProduct)(formattedData).unwrap();
    } catch (e) {
      console.log(e);
      const message = isNew ? t('message:PRODUCT.ERROR.CREATE') : t('message:PRODUCT.ERROR.UPDATE');
      dispatch(enqueueErrorSnackbar(message));
      return;
    }

    dispatch(getProducts());

    const message = isNew
      ? t('message:PRODUCT.SUCCESS.CREATE')
      : t('message:PRODUCT.SUCCESS.UPDATE');
    dispatch(enqueueSuccessSnackbar(message));

    // Set product_id for the newly created product. Should be called after getProducts()
    callback(result?.product_id);
  };

  return (
    <>
      <div className={styles.applicationMethod}>
        <Controller
          control={control}
          name={METHOD_ID}
          rules={{ required: true }}
          render={({ field: { onChange, value: selectedId } }) => (
            <ReactSelect
              value={methodsOptions.find(({ value }) => value === selectedId)}
              isDisabled={disabled}
              label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.APPLICATION_METHOD')}
              options={methodsOptions}
              onChange={(e) => {
                onChange(e?.value);
              }}
            />
          )}
        />
        {methodId === methodIdsMap['FURROW_HOLE'] && (
          <>
            {/* @ts-ignore */}
            <Unit
              label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.FURROW_HOLE_DEPTH')}
              name={FURROW_HOLE_DEPTH}
              displayUnitName={FURROW_HOLE_DEPTH_UNIT}
              unitType={furrow_hole_depth}
              register={register}
              control={control}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
              hookFromWatch={watch}
              defaultValue={undefined} // TODO
              system={system}
              placeholder={t('ADD_TASK.SOIL_AMENDMENT_VIEW.FURROW_HOLE_DEPTH_PLACEHOLDER')}
              disabled={disabled}
              shouldUnregister={true}
            />
          </>
        )}
        {methodId === methodIdsMap['OTHER'] && (
          <>
            {/* @ts-ignore */}
            <Input
              label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER_METHOD')}
              name={OTHER_APPLICATION_METHOD}
              disabled={disabled}
              hookFormRegister={register(OTHER_APPLICATION_METHOD, { shouldUnregister: true })}
              optional
              placeholder={t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER_METHOD_PLACEHOLDER')}
            />
          </>
        )}
      </div>
      <FormProvider {...props}>
        <AddSoilAmendmentProducts
          farm={farm}
          system={system}
          products={products}
          purposes={purposes}
          fertiliserTypes={fertiliserTypes}
          isReadOnly={disabled}
          onSaveProduct={onSaveProduct}
          locations={locations}
        />
      </FormProvider>
    </>
  );
};

export default PureSoilAmendmentTask;
