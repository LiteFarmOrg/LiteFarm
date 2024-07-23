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
import { hookFormMaxCharsValidation } from '../../../Form/hookformValidationUtils';
import TextButton from '../../../Form/Button/TextButton';
import RadioGroup from '../../../Form/RadioGroup';
import CompositionInputs from '../../../Form/CompositionInputs';
import ReactSelect from '../../../Form/ReactSelect';
import Buttons from './Buttons';
import { type ProductFormFields, type ProductId, PRODUCT_FIELD_NAMES, Nutrients } from '../types';
import {
  ElementalUnit,
  MolecularCompoundsUnit,
  type SoilAmendmentProduct,
} from '../../../../store/api/types';
import useInputsInfo from './useInputsInfo';
import { CANADA } from '../../AddProduct/constants';
import { roundToTwoDecimal } from '../../../../util';
import useExpandable from '../../../Expandable/useExpandableItem';
import styles from '../styles.module.scss';

const {
  FERTILISER_TYPE_ID,
  MOISTURE_CONTENT,
  DRY_MATTER_CONTENT,
  SUPPLIER,
  PERMITTED,
  COMPOSITION,
  ELEMENTAL_UNIT,
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
  MOLECULAR_COMPOUNDS_UNIT,
} = PRODUCT_FIELD_NAMES;

const elementalUnitOptions = [
  { label: '%', value: ElementalUnit.PERCENT },
  { label: ElementalUnit.RATIO, value: ElementalUnit.RATIO },
  { label: ElementalUnit.PPM, value: ElementalUnit.PPM },
  { label: ElementalUnit['MG/KG'], value: ElementalUnit['MG/KG'] },
];

const molecularCompoundsUnitOptions = [
  { label: MolecularCompoundsUnit.PPM, value: MolecularCompoundsUnit.PPM },
  { label: MolecularCompoundsUnit['MG/KG'], value: MolecularCompoundsUnit['MG/KG'] },
];

export type ProductDetailsProps = {
  productId: number | string;
  products?: SoilAmendmentProduct[];
  isReadOnly: boolean;
  isExpanded: boolean;
  farm: { farm_id: string; interested: boolean; country_id: number };
  expand: () => void;
  unExpand: () => void;
  toggleExpanded: () => void;
  clearProduct: () => void;
  setProductId: (id: ProductId) => void;
  onSave: (
    data: ProductFormFields & { product_id: ProductId },
    callback?: (id: ProductId) => void,
  ) => Promise<void>;
  fertiliserTypeOptions: { label: string; value: number }[];
  productsVersion: number;
};

export const isNewProduct = (productId: ProductId): boolean => typeof productId === 'string';

const MG_KG_REACT_SELECT_WIDTH = 76;

export const defaultValues = {
  [SUPPLIER]: '',
  [COMPOSITION]: {
    [ELEMENTAL_UNIT]: ElementalUnit.RATIO,
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
  [MOLECULAR_COMPOUNDS_UNIT]: MolecularCompoundsUnit.PPM,
};

const subtractFrom100 = (value: number) => +(100 * 100 - value * 100) / 100;

const ProductDetails = ({
  productId,
  products = [],
  isReadOnly,
  isExpanded,
  farm: { country_id, interested },
  expand,
  unExpand,
  toggleExpanded: toggleProductDetailsExpanded,
  clearProduct,
  setProductId,
  onSave,
  fertiliserTypeOptions,
  productsVersion,
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

  const [
    moistureContent,
    dryMatterContent,
    ammonium,
    nitrate,
    fertiliserType,
    molecularCompoundsUnit,
  ] = watch([
    MOISTURE_CONTENT,
    DRY_MATTER_CONTENT,
    AMMONIUM,
    NITRATE,
    FERTILISER_TYPE_ID,
    MOLECULAR_COMPOUNDS_UNIT,
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

    const selectedProductData = selectedProduct?.soil_amendment_product;

    const newDryMatterContent =
      typeof selectedProductData?.[MOISTURE_CONTENT] === 'number'
        ? subtractFrom100(selectedProductData[MOISTURE_CONTENT] as number)
        : undefined;

    if (!productId || !shouldNotResetFields) {
      reset({
        [SUPPLIER]: selectedProduct?.[SUPPLIER] || '',
        [PERMITTED]: selectedProduct?.[PERMITTED] || undefined,
        [FERTILISER_TYPE_ID]: selectedProductData?.[FERTILISER_TYPE_ID] || undefined,
        [MOISTURE_CONTENT]: selectedProductData?.[MOISTURE_CONTENT] ?? NaN,
        [DRY_MATTER_CONTENT]: newDryMatterContent,
        [COMPOSITION]: {
          [ELEMENTAL_UNIT]: selectedProductData?.[ELEMENTAL_UNIT] || ElementalUnit.RATIO,
          [N]: selectedProductData?.[N] ?? NaN,
          [P]: selectedProductData?.[P] ?? NaN,
          [K]: selectedProductData?.[K] ?? NaN,
          [CA]: selectedProductData?.[CA] ?? NaN,
          [MG]: selectedProductData?.[MG] ?? NaN,
          [S]: selectedProductData?.[S] ?? NaN,
          [CU]: selectedProductData?.[CU] ?? NaN,
          [MN]: selectedProductData?.[MN] ?? NaN,
          [B]: selectedProductData?.[B] ?? NaN,
        },
        [AMMONIUM]: selectedProductData?.[AMMONIUM] ?? NaN,
        [NITRATE]: selectedProductData?.[NITRATE] ?? NaN,
        [MOLECULAR_COMPOUNDS_UNIT]:
          selectedProductData?.[MOLECULAR_COMPOUNDS_UNIT] ?? MolecularCompoundsUnit.PPM,
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
  }, [productId, productsVersion]);

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
    const callback = (id: ProductId) => {
      if (isNewProduct(productId)) {
        setProductId(id);
      }

      setIsEditingProduct(false);
      reset(getValues());
    };
    onSave({ ...data, product_id: productId }, callback);
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
    shouldShowErrorMessage = false,
  }: {
    mainLabel?: string;
    inputsInfo: { name: string; label: string }[];
    shouldShowErrorMessage: boolean;
  }) => {
    return (
      <Controller
        name={COMPOSITION}
        control={control}
        rules={{
          validate: (value: ProductFormFields['composition']): boolean | string => {
            if (!value || value[ELEMENTAL_UNIT] !== ElementalUnit.PERCENT) {
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
              unitOptions={elementalUnitOptions}
              inputsInfo={inputsInfo}
              disabled={isDetailDisabled}
              error={fieldState.error?.message}
              shouldShowErrorMessage={shouldShowErrorMessage}
              values={field.value || {}}
              onChange={(name, value) => field.onChange({ ...field.value, [name]: value })}
              // onBlur needs to be passed manually
              // https://stackoverflow.com/questions/61661432/how-to-make-react-hook-form-controller-validation-triggered-on-blur
              onBlur={field.onBlur}
              unitFieldName={ELEMENTAL_UNIT}
              reactSelectWidth={MG_KG_REACT_SELECT_WIDTH}
            />
          );
        }}
      />
    );
  };

  const handleMolecularCompoundsChange = (name: string, value: string | number | null): void => {
    let newValue: MolecularCompoundsUnit | number | undefined;
    if (value === MolecularCompoundsUnit.PPM || value === MolecularCompoundsUnit['MG/KG']) {
      newValue = value as MolecularCompoundsUnit;
    } else {
      newValue = value ? +value : undefined;
    }

    setValue(name as typeof AMMONIUM | typeof NITRATE | typeof MOLECULAR_COMPOUNDS_UNIT, newValue);
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
              maxLength: hookFormMaxCharsValidation(255),
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
            onChange={(e) => setValue(FERTILISER_TYPE_ID, e?.value)}
            optional
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
            shouldShowErrorMessage: !isAdditionalNutrientsExpanded,
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
                  shouldShowErrorMessage: true,
                })}

                <CompositionInputs
                  disabled={isDetailDisabled}
                  onChange={handleMolecularCompoundsChange}
                  inputsInfo={inputsInfo.ammoniumNitrate}
                  values={{
                    [AMMONIUM]: ammonium,
                    [NITRATE]: nitrate,
                    [MOLECULAR_COMPOUNDS_UNIT]: molecularCompoundsUnit,
                  }}
                  unitOptions={molecularCompoundsUnitOptions}
                  unitFieldName={MOLECULAR_COMPOUNDS_UNIT}
                  reactSelectWidth={MG_KG_REACT_SELECT_WIDTH}
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
