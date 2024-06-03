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

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowUp';
import { ReactComponent as RatioOptionIcon } from '../../../../assets/images/ratio-option.svg';
import InputBaseLabel from '../../../Form/InputBase/InputBaseLabel';
import Input, { getInputErrors } from '../../../Form/Input';
import TextButton from '../../../Form/Button/TextButton';
import RadioGroup from '../../../Form/RadioGroup';
import CompositionInputs from '../../../Form/CompositionInputs';
import { NPK, UNIT, Unit } from '../../../Form/CompositionInputs/NumberInputWithSelect';
import Buttons from './Buttons';
import { FIELD_NAMES, type FormFields, type Product, type ProductId } from '../types';
import { CANADA } from '../../AddProduct/constants';
import { TASK_TYPES } from '../../../../containers/Task/constants';
import styles from '../styles.module.scss';

const unitOptions = [
  { label: '%', value: Unit.PERCENT },
  { label: <RatioOptionIcon />, value: Unit.RATIO },
];

export type ProductDetailsProps = {
  productId: number | string;
  products?: Product[];
  isReadOnly: boolean;
  isExpanded: boolean;
  farm: { farm_id: string; interested: boolean; country_id: number };
  expand: () => void;
  unExpand: () => void;
  toggleExpanded: () => void;
  clearProduct: () => void;
  setProductId: (id: number | string | undefined) => void;
  onSave: (
    data: FormFields & { farm_id: string; product_id: ProductId; type: string },
    callback?: (id: number) => void,
  ) => void;
  setFieldValidity: (isValid: boolean) => void;
};

const isNewProduct = (productId: ProductId): boolean => typeof productId === 'string';

export const defaultValues = {
  [FIELD_NAMES.SUPPLIER]: '',
  [FIELD_NAMES.COMPOSITION]: {
    [FIELD_NAMES.UNIT]: Unit.RATIO,
    [FIELD_NAMES.N]: NaN,
    [FIELD_NAMES.P]: NaN,
    [FIELD_NAMES.K]: NaN,
  },
};

const ProductDetails = ({
  productId,
  products = [],
  isReadOnly,
  isExpanded,
  farm: { farm_id, country_id, interested },
  expand,
  unExpand,
  toggleExpanded,
  clearProduct,
  setProductId,
  onSave,
  setFieldValidity,
}: ProductDetailsProps) => {
  const { t } = useTranslation();
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const previousProductIdRef = useRef<number | string | undefined>(productId);

  const inCanada = country_id === CANADA;
  const isDetailDisabled = isReadOnly || !isEditingProduct;
  const isProductEntered = !!productId;

  const {
    control,
    getValues,
    handleSubmit,
    reset,
    setFocus,
    trigger,
    register,
    formState: { errors, isValid, isDirty },
  } = useForm<FormFields>({
    mode: 'onBlur',
    defaultValues,
  });

  useEffect(() => {
    const selectedProduct = products.find(({ product_id }) => product_id === productId);
    const { supplier, on_permitted_substances_list, n, p, k, npk_unit } = selectedProduct || {};

    const wasAddingNewProduct = isNewProduct(previousProductIdRef.current);
    const isAddingNewProduct = !!(productId && !selectedProduct);
    const shouldNotResetFields = wasAddingNewProduct && isAddingNewProduct;

    if (!productId || !shouldNotResetFields) {
      reset({
        [FIELD_NAMES.SUPPLIER]: supplier || '',
        [FIELD_NAMES.PERMITTED]: on_permitted_substances_list || undefined,
        [FIELD_NAMES.COMPOSITION]: {
          [FIELD_NAMES.UNIT]: npk_unit || Unit.RATIO,
          [FIELD_NAMES.N]: n ?? NaN,
          [FIELD_NAMES.P]: p ?? NaN,
          [FIELD_NAMES.K]: k ?? NaN,
        },
      });
    }

    setIsEditingProduct(isAddingNewProduct);
    if (isAddingNewProduct) {
      expand();
    }

    trigger();

    if (isAddingNewProduct && productId) {
      // Wait for the card to be expaneded
      setTimeout(() => {
        setFocus(FIELD_NAMES.SUPPLIER);
      }, 0);
    }
    previousProductIdRef.current = productId;
  }, [productId]);

  useEffect(() => {
    setFieldValidity(isValid);
  }, [isValid]);

  const onCancel = () => {
    if (isNewProduct(productId)) {
      clearProduct();
      setProductId(undefined);
      unExpand();
    } else {
      reset();
      setIsEditingProduct(false);
    }
  };

  const onSubmit = (data: FormFields) => {
    const callback = isNewProduct(productId) ? setProductId : undefined;
    onSave({ ...data, farm_id, product_id: productId, type: TASK_TYPES.SOIL_AMENDMENT }, callback);

    setIsEditingProduct(false);
    reset(getValues());
  };

  return (
    <div
      className={clsx(
        styles.border,
        !isProductEntered && styles.disabled,
        isExpanded && styles.expanded,
        styles.productDetails,
      )}
    >
      <TextButton
        disabled={!isProductEntered}
        onClick={toggleExpanded}
        className={clsx(styles.productDetailsTitle)}
      >
        <span>{t('ADD_PRODUCT.PRODUCT_DETAILS')}</span>
        <KeyboardArrowDownIcon className={styles.expandIcon} />
      </TextButton>

      <Collapse id={`product_details-${productId}`} in={isExpanded} timeout="auto" unmountOnExit>
        <div className={styles.sectionBody}>
          {/* @ts-ignore */}
          <Input
            name={FIELD_NAMES.SUPPLIER}
            label={t('ADD_PRODUCT.SUPPLIER_LABEL')}
            hookFormRegister={register(FIELD_NAMES.SUPPLIER, {
              required: interested,
              maxLength: 255,
            })}
            disabled={isDetailDisabled}
            hasLeaf={true}
            errors={getInputErrors(errors, FIELD_NAMES.SUPPLIER)}
            optional={!interested}
          />
          {interested && inCanada && (
            <div className={styles.permitedSubstance}>
              <InputBaseLabel hasLeaf label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.IS_PERMITTED')} />
              {/* @ts-ignore */}
              <RadioGroup
                hookFormControl={control}
                name={FIELD_NAMES.PERMITTED}
                required={true}
                disabled={isDetailDisabled}
                showNotSure
              />
            </div>
          )}

          <Controller
            name={FIELD_NAMES.COMPOSITION}
            control={control}
            rules={{
              validate: (value): boolean | string => {
                if (!value || value[UNIT] !== Unit.PERCENT) {
                  return true;
                }
                return (
                  (value[NPK.N] || 0) + (value[NPK.P] || 0) + (value[NPK.K] || 0) <= 100 ||
                  t('ADD_PRODUCT.COMPOSITION_ERROR')
                );
              },
            }}
            render={({ field, fieldState }) => {
              return (
                <CompositionInputs
                  unitOptions={unitOptions}
                  inputsInfo={[
                    { name: NPK.N, label: t('ADD_PRODUCT.NITROGEN') },
                    { name: NPK.P, label: t('ADD_PRODUCT.PHOSPHOROUS') },
                    { name: NPK.K, label: t('ADD_PRODUCT.POTASSIUM') },
                  ]}
                  disabled={isDetailDisabled}
                  error={fieldState.error?.message}
                  values={field.value}
                  onChange={(name, value) => {
                    field.onChange({ ...field.value, [name]: value });
                  }}
                  // onBlur needs to be passed manually
                  // https://stackoverflow.com/questions/61661432/how-to-make-react-hook-form-controller-validation-triggered-on-blur
                  onBlur={field.onBlur}
                />
              );
            }}
          />

          {!isReadOnly && (
            <Buttons
              isEditingProduct={isEditingProduct}
              isEditDisabled={!isProductEntered}
              isSaveDisabled={!isProductEntered || !(isDirty && isValid)}
              onCancel={onCancel}
              onEdit={() => setIsEditingProduct(true)}
              onSave={handleSubmit(onSubmit)}
            />
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default ProductDetails;
