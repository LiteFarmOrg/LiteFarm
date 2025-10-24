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
import { useSelector } from 'react-redux';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import {
  useGetSoilAmendmentMethodsQuery,
  useGetSoilAmendmentPurposesQuery,
  useGetSoilAmendmentFertiliserTypesQuery,
} from '../../../store/api/apiSlice';
import ReactSelect from '../../Form/ReactSelect';
import Input, { getInputErrors } from '../../Form/Input';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';
import Unit from '../../Form/Unit';
import AddSoilAmendmentProducts from '../AddSoilAmendmentProducts';
import { type ProductCardProps } from '../AddSoilAmendmentProducts/ProductCard';
import { MolecularCompound, Nutrients, TASK_FIELD_NAMES } from '../AddSoilAmendmentProducts/types';
import type { SoilAmendmentProduct } from '../../../store/api/types';
import { furrow_hole_depth } from '../../../util/convert-units/unit';
import styles from './styles.module.scss';
import { locationsSelector } from '../../../containers/locationSlice';

// Return products in inventory plus removed ones already used in the task.
const getAvailableProducts = (
  usedProductsInTask: SoilAmendmentProduct[] | undefined,
  products: SoilAmendmentProduct[],
) => {
  const usedProductIds = new Set(usedProductsInTask?.map(({ product_id }) => product_id));
  return products.filter((product) => !product.removed || usedProductIds.has(product.product_id));
};

type PureSoilAmendmentTaskProps = UseFormReturn &
  Pick<ProductCardProps, 'farm' | 'system' | 'products'> & {
    disabled: boolean;
    task?: {
      locations: { location_id: number }[];
      soil_amendment_task_products: SoilAmendmentProduct[];
    };
    locations: { location_id: number }[];
  };

export const hasNoValue = (
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
  const {
    control,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = props;

  const { t } = useTranslation(['translation', 'message']);

  const { task, locations: propLocations } = props;
  const taskLocationIds = (task?.locations || propLocations)?.map(({ location_id }) => location_id);
  const locations = useSelector(locationsSelector).filter(({ location_id }) =>
    taskLocationIds?.includes(location_id),
  );

  const { data: methods = [] } = useGetSoilAmendmentMethodsQuery();
  const { data: purposes = [] } = useGetSoilAmendmentPurposesQuery();
  const { data: fertiliserTypes = [] } = useGetSoilAmendmentFertiliserTypesQuery();

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
            {/* @ts-expect-error */}
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
            {/* @ts-expect-error */}
            <Input
              label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER_METHOD')}
              name={OTHER_APPLICATION_METHOD}
              disabled={disabled}
              hookFormRegister={register(OTHER_APPLICATION_METHOD, {
                shouldUnregister: true,
                maxLength: hookFormMaxCharsValidation(255),
              })}
              errors={getInputErrors(errors, OTHER_APPLICATION_METHOD)}
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
          products={getAvailableProducts(task?.soil_amendment_task_products, products)}
          purposes={purposes}
          fertiliserTypes={fertiliserTypes}
          isReadOnly={disabled}
          locations={locations}
        />
      </FormProvider>
    </>
  );
};

export default PureSoilAmendmentTask;
