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
import InputBaseLabel from '../../../Form/InputBase/InputBaseLabel';
import Input, { getInputErrors } from '../../../Form/Input';
import TextButton from '../../../Form/Button/TextButton';
import RadioGroup from '../../../Form/RadioGroup';
import CompositionInputs from '../../../Form/CompositionInputs';
import ReactSelect from '../../../Form/ReactSelect';
import Buttons from './Buttons';
import {
  PRODUCT_FIELD_NAMES,
  Nutrients,
  Unit,
  type ProductFormFields,
  type Product,
  type ProductId,
} from '../types';
import useInputsInfo from './useInputsInfo';
import { CANADA } from '../../AddProduct/constants';
import { TASK_TYPES } from '../../../../containers/Task/constants';
import { roundToTwoDecimal } from '../../../../util';
import useExpandable from '../../../Expandable/useExpandableItem';
import styles from '../styles.module.scss';

const {
  FERTILISER_TYPE,
  MOISTURE_CONTENT,
  DRY_MATTER_CONTENT,
  SUPPLIER,
  PERMITTED,
  COMPOSITION,
  UNIT,
  N,
  P,
  K,
  CA,
  MG,
  S,
  CU,
  MN,
  B,
  AMMONIUM,
  NITRATE,
} = PRODUCT_FIELD_NAMES;

const unitOptions = [
  { label: '%', value: Unit.PERCENT },
  { label: Unit.RATIO, value: Unit.RATIO },
  { label: Unit.PPM, value: Unit.PPM },
  { label: Unit['MG/KG'], value: Unit['MG/KG'] },
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
  setProductId: (id: ProductId) => void;
  onSave: (
    data: ProductFormFields & { farm_id: string; product_id: ProductId; type: string },
    callback?: (id: number) => void,
  ) => void;
  fertiliserTypeOptions: { label: string; value: number }[];
};

const isNewProduct = (productId: ProductId): boolean => typeof productId === 'string';

const MG_KG_REACT_SELECT_WIDTH = 76;

export const defaultValues = {
  [SUPPLIER]: '',
  [COMPOSITION]: {
    [UNIT]: Unit.RATIO,
    [N]: NaN,
    [P]: NaN,
    [K]: NaN,
    [CA]: NaN,
    [MG]: NaN,
    [S]: NaN,
    [CU]: NaN,
    [MN]: NaN,
    [B]: NaN,
  },
};

const subtractFrom100 = (value: number) => +(100 * 100 - value * 100) / 100;

const ProductDetails = ({
  productId,
  products = [],
  isReadOnly,
  isExpanded,
  farm: { farm_id, country_id, interested },
  expand,
  unExpand,
  toggleExpanded: toggleProductDetailsExpanded,
  clearProduct,
  setProductId,
  onSave,
  fertiliserTypeOptions,
}: ProductDetailsProps) => {
  const { t } = useTranslation();
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const previousProductIdRef = useRef<ProductId>(productId);

  const inCanada = country_id === CANADA;
  const isDetailDisabled = isReadOnly || !isEditingProduct;
  const isProductEntered = !!productId;

  const additionalNutrientsId = `additional-nutrients-${productId}`;

  const {
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    reset,
    setFocus,
    trigger,
    register,
    formState: { errors, isValid },
  } = useForm<ProductFormFields>({
    mode: 'onBlur',
    defaultValues,
  });

  const [moistureContent, dryMatterContent, ammonium, nitrate, fertiliserType] = watch([
    MOISTURE_CONTENT,
    DRY_MATTER_CONTENT,
    AMMONIUM,
    NITRATE,
    FERTILISER_TYPE,
  ]);

  const {
    expandedIds: expandedAdditionalNutrientsIds,
    toggleExpanded: toggleAdditionalNutrientsExpanded,
    unExpand: unExpandAdditionalNutrients,
  } = useExpandable();

  const inputsInfo = useInputsInfo();

  const isAdditionalNutrientsExpanded =
    expandedAdditionalNutrientsIds.includes(additionalNutrientsId);

  useEffect(() => {
    const selectedProduct = products.find(({ product_id }) => product_id === productId);
    const wasAddingNewProduct = isNewProduct(previousProductIdRef.current);
    const isAddingNewProduct = !!(productId && !selectedProduct);
    const shouldNotResetFields = wasAddingNewProduct && isAddingNewProduct;

    const newDryMatterContent =
      typeof selectedProduct?.[MOISTURE_CONTENT] === 'number'
        ? subtractFrom100(selectedProduct[MOISTURE_CONTENT] as number)
        : undefined;

    if (!productId || !shouldNotResetFields) {
      reset({
        [SUPPLIER]: selectedProduct?.[SUPPLIER] || '',
        [PERMITTED]: selectedProduct?.[PERMITTED] || undefined,
        [FERTILISER_TYPE]: selectedProduct?.[FERTILISER_TYPE] || undefined,
        [MOISTURE_CONTENT]: selectedProduct?.[MOISTURE_CONTENT] ?? undefined,
        [DRY_MATTER_CONTENT]: newDryMatterContent,
        [COMPOSITION]: {
          [UNIT]: selectedProduct?.[UNIT] || Unit.RATIO,
          [N]: selectedProduct?.[N] ?? NaN,
          [P]: selectedProduct?.[P] ?? NaN,
          [K]: selectedProduct?.[K] ?? NaN,
          [CA]: selectedProduct?.[CA] ?? NaN,
          [MG]: selectedProduct?.[MG] ?? NaN,
          [S]: selectedProduct?.[S] ?? NaN,
          [CU]: selectedProduct?.[CU] ?? NaN,
          [MN]: selectedProduct?.[MN] ?? NaN,
          [B]: selectedProduct?.[B] ?? NaN,
        },
        [AMMONIUM]: selectedProduct?.[AMMONIUM] ?? NaN,
        [NITRATE]: selectedProduct?.[NITRATE] ?? NaN,
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
        setFocus(SUPPLIER);
      }, 0);
    }
    previousProductIdRef.current = productId;
  }, [productId]);

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

  const onSubmit = (data: ProductFormFields) => {
    const callback = isNewProduct(productId) ? setProductId : undefined;
    onSave({ ...data, farm_id, product_id: productId, type: TASK_TYPES.SOIL_AMENDMENT }, callback);

    setIsEditingProduct(false);
    reset(getValues());
  };

  const handleMoistureDryMatterContentChange = (fieldName: string, value?: number) => {
    const theOtherField = fieldName === MOISTURE_CONTENT ? DRY_MATTER_CONTENT : MOISTURE_CONTENT;
    const inputtedFieldValue =
      typeof value === 'number' ? Math.min(100, roundToTwoDecimal(value)) : undefined;
    const theOtherFieldValue =
      typeof inputtedFieldValue === 'number' ? subtractFrom100(inputtedFieldValue) : undefined;

    setValue(fieldName as typeof MOISTURE_CONTENT | typeof DRY_MATTER_CONTENT, inputtedFieldValue);
    setValue(theOtherField, theOtherFieldValue);
  };

  const toggleProductDetails = () => {
    toggleProductDetailsExpanded();

    if (isAdditionalNutrientsExpanded) {
      unExpandAdditionalNutrients(additionalNutrientsId);
    }
  };

  const renderCompositionInputsWithController = ({
    mainLabel = '',
    inputsInfo,
    shouldShowError = false,
  }: {
    mainLabel?: string;
    inputsInfo: { name: string; label: string }[];
    shouldShowError: boolean;
  }) => {
    return (
      <Controller
        name={COMPOSITION}
        control={control}
        rules={{
          validate: (value: ProductFormFields['composition']): boolean | string => {
            if (!value || value[UNIT] !== Unit.PERCENT) {
              return true;
            }
            const total = Object.keys(Nutrients).reduce((acc: number, key) => {
              const valueKey = Nutrients[key as keyof typeof Nutrients];
              return acc + (value[valueKey] || 0);
            }, 0);
            return total <= 100 || t('ADD_PRODUCT.COMPOSITION_ERROR');
          },
        }}
        render={({ field, fieldState }) => {
          return (
            <CompositionInputs
              mainLabel={mainLabel}
              unitOptions={unitOptions}
              inputsInfo={inputsInfo}
              disabled={isDetailDisabled}
              error={shouldShowError ? fieldState.error?.message : undefined}
              values={field.value || {}}
              onChange={(name, value) => field.onChange({ ...field.value, [name]: value })}
              // onBlur needs to be passed manually
              // https://stackoverflow.com/questions/61661432/how-to-make-react-hook-form-controller-validation-triggered-on-blur
              onBlur={field.onBlur}
              unitFieldName={UNIT}
              reactSelectWidth={MG_KG_REACT_SELECT_WIDTH}
            />
          );
        }}
      />
    );
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
        onClick={toggleProductDetails}
        className={clsx(styles.productDetailsTitle)}
      >
        <span>{t('ADD_PRODUCT.PRODUCT_DETAILS')}</span>
        <KeyboardArrowDownIcon className={clsx(styles.expandIcon, isExpanded && styles.expanded)} />
      </TextButton>

      <Collapse id={`product_details-${productId}`} in={isExpanded} timeout="auto" unmountOnExit>
        <div className={styles.productDetailsContent}>
          {/* @ts-ignore */}
          <Input
            name={SUPPLIER}
            label={t('ADD_PRODUCT.SUPPLIER_LABEL')}
            hookFormRegister={register(SUPPLIER, {
              required: interested,
              maxLength: 255,
            })}
            disabled={isDetailDisabled}
            hasLeaf={true}
            errors={getInputErrors(errors, SUPPLIER)}
            optional={!interested}
          />
          {interested && inCanada && (
            <div className={styles.permitedSubstance}>
              <InputBaseLabel hasLeaf label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.IS_PERMITTED')} />
              {/* @ts-ignore */}
              <RadioGroup
                hookFormControl={control}
                name={PERMITTED}
                required={true}
                disabled={isDetailDisabled}
                showNotSure
              />
            </div>
          )}

          <ReactSelect
            value={fertiliserTypeOptions.find(({ value }) => value === fertiliserType) || null}
            isDisabled={isDetailDisabled}
            label={t('ADD_PRODUCT.FERTILISER_TYPE')}
            placeholder={t('ADD_PRODUCT.FERTILISER_TYPE_PLACEHOLDER')}
            options={fertiliserTypeOptions}
            onChange={(e) => setValue(FERTILISER_TYPE, e?.value)}
          />

          <CompositionInputs
            disabled={isDetailDisabled}
            onChange={(fieldName: string, value: string | number | null): void => {
              handleMoistureDryMatterContentChange(
                fieldName,
                value === null || value === undefined ? undefined : +value,
              );
            }}
            inputsInfo={inputsInfo.moistureDrymatterContents}
            values={{ [MOISTURE_CONTENT]: moistureContent, [DRY_MATTER_CONTENT]: dryMatterContent }}
            unit="%"
          />

          {renderCompositionInputsWithController({
            mainLabel: t('ADD_PRODUCT.COMPOSITION'),
            inputsInfo: inputsInfo.npk,
            shouldShowError: true, // TODO
          })}

          <div className={clsx(styles.additionalNutrients)}>
            <TextButton
              disabled={!isProductEntered}
              onClick={() => toggleAdditionalNutrientsExpanded(additionalNutrientsId)}
              className={clsx(styles.additionalNutrientsTitle)}
            >
              <span>{t('ADD_PRODUCT.ADDITIONAL_NUTRIENTS')}</span>
              <KeyboardArrowDownIcon
                className={clsx(
                  styles.expandIcon,
                  isAdditionalNutrientsExpanded && styles.expanded,
                )}
              />
            </TextButton>

            <Collapse
              id={additionalNutrientsId}
              in={isAdditionalNutrientsExpanded}
              timeout="auto"
              unmountOnExit
            >
              <div className={styles.additionalNutrientsBody}>
                {renderCompositionInputsWithController({
                  inputsInfo: inputsInfo.additionalNutrients,
                  shouldShowError: true, // TODO
                })}

                <CompositionInputs
                  disabled={isDetailDisabled}
                  onChange={(fieldName: string, value: string | number | null): void => {
                    setValue(
                      fieldName as typeof AMMONIUM | typeof NITRATE,
                      value ? +value : undefined,
                    );
                  }}
                  inputsInfo={inputsInfo.ammoniumNitrate}
                  values={{ [AMMONIUM]: ammonium, [NITRATE]: nitrate }}
                  unit="ppm"
                />
              </div>
            </Collapse>
          </div>

          {!isReadOnly && (
            <Buttons
              isEditingProduct={isEditingProduct}
              isEditDisabled={!isProductEntered}
              isSaveDisabled={!isProductEntered || !isValid}
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
