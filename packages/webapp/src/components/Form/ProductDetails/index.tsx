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

import { useEffect, useRef, useState, ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowUp';
import InputBaseLabel from '../InputBase/InputBaseLabel';
import Input, { getInputErrors } from '../Input';
import { hookFormMaxCharsValidation } from '../hookformValidationUtils';
import TextButton from '../Button/TextButton';
import RadioGroup from '../RadioGroup';
import CompositionInputs from '../CompositionInputs';
import ReactSelect from '../ReactSelect';
import Buttons from './Buttons';
import {
  type ProductFormFields,
  type ProductId,
  PRODUCT_FIELD_NAMES,
  Nutrients,
} from '../../Task/AddSoilAmendmentProducts/types';
import {
  ElementalUnit,
  MolecularCompoundsUnit,
  type SoilAmendmentProduct,
} from '../../../store/api/types';
import useInputsInfo from './useInputsInfo';
import { CANADA } from '../../Task/AddProduct/constants';
import { roundToTwoDecimal } from '../../../util';
import { getSoilAmendmentFormValues, subtractFrom100 } from './utils';
import useExpandable from '../../Expandable/useExpandableItem';
import styles from './styles.module.scss';

const {
  FERTILISER_TYPE_ID,
  MOISTURE_CONTENT,
  DRY_MATTER_CONTENT,
  SUPPLIER,
  PERMITTED,
  COMPOSITION,
  ELEMENTAL_UNIT,
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

type CommonProps = {
  productId?: number | string;
  products?: SoilAmendmentProduct[];
  isReadOnly: boolean;
  farm: { farm_id: string; interested: boolean; country_id: number };
  fertiliserTypeOptions: { label: string; value: number }[];
};

export type NestedProductDetailsProps = CommonProps & {
  isNestedForm: true;
  isExpanded: boolean;
  expand: () => void;
  unExpand: () => void;
  toggleExpanded: () => void;
  productsVersion: number;
  clearProduct: () => void;
  setProductId: (id: ProductId) => void;
  onSave: (
    data: ProductFormFields & { product_id: ProductId },
    callback?: (id: ProductId) => void,
  ) => Promise<void>;
};

export type StandaloneProductDetailsProps = CommonProps & {
  isNestedForm: false;
};

export const isNewProduct = (productId: ProductId): boolean => typeof productId === 'string';

const MG_KG_REACT_SELECT_WIDTH = 76;

const ProductDetails = (props: NestedProductDetailsProps | StandaloneProductDetailsProps) => {
  const {
    isNestedForm,
    productId,
    products = [],
    isReadOnly,
    farm: { country_id, interested },
    fertiliserTypeOptions,
  } = props;
  const isExpanded = isNestedForm ? props.isExpanded : undefined;
  const productsVersion = isNestedForm ? props.productsVersion : undefined;

  const { t } = useTranslation();
  const [isEditingProduct, setIsEditingProduct] = useState(isNestedForm ? false : !isReadOnly);
  const previousProductIdRef = useRef<ProductId>(productId);

  const inCanada = country_id === CANADA;
  const isDetailDisabled = isReadOnly || (isNestedForm && !isEditingProduct);
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
  } = useFormContext<ProductFormFields>();

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
    if (!isNestedForm) {
      return;
    }
    const selectedProduct = products.find(({ product_id }) => product_id === productId);
    const wasAddingNewProduct = isNewProduct(previousProductIdRef.current);
    const isAddingNewProduct = !!(productId && !selectedProduct);
    const shouldNotResetFields = wasAddingNewProduct && isAddingNewProduct;

    if (!productId || !shouldNotResetFields) {
      reset(getSoilAmendmentFormValues(selectedProduct));
    }

    setIsEditingProduct(isAddingNewProduct);
    if (isAddingNewProduct) {
      props.expand();
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
    if (!isNestedForm) {
      return;
    }
    if (isNewProduct(productId)) {
      props.clearProduct();
      props.setProductId(undefined);
      if (isNestedForm) {
        props.unExpand();
      }
    } else {
      reset();
      setIsEditingProduct(false);
    }
  };

  const onSubmit = (data: ProductFormFields) => {
    if (!isNestedForm) {
      return;
    }
    const callback = (id: ProductId) => {
      if (isNewProduct(productId)) {
        props.setProductId(id);
      }

      setIsEditingProduct(false);
      reset(getValues());
    };
    props.onSave({ ...data, product_id: productId }, callback);
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
    if (!isNestedForm) {
      return;
    }
    props.toggleExpanded();

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
        isNestedForm && !isProductEntered && styles.disabled,
        isExpanded && styles.expanded,
        styles.productDetails,
      )}
    >
      {isNestedForm && (
        <TextButton
          disabled={!isProductEntered}
          onClick={toggleProductDetails}
          className={clsx(styles.productDetailsTitle)}
        >
          <span>{t('ADD_PRODUCT.PRODUCT_DETAILS')}</span>
          <KeyboardArrowDownIcon
            className={clsx(styles.expandIcon, isExpanded && styles.expanded)}
          />
        </TextButton>
      )}

      <Wrapper collapsible={isNestedForm} productId={productId} isExpanded={isExpanded}>
        <div className={clsx(styles.productDetailsContent, isNestedForm && styles.isNestedForm)}>
          {/* @ts-expect-error */}
          <Input
            name={SUPPLIER}
            label={t('ADD_PRODUCT.SUPPLIER_LABEL')}
            hookFormRegister={register(SUPPLIER, {
              required: interested,
              maxLength: hookFormMaxCharsValidation(255),
              setValueAs: (value) => value.trim(),
            })}
            disabled={isDetailDisabled}
            hasLeaf={true}
            errors={getInputErrors(errors, SUPPLIER)}
            optional={!interested}
          />
          {interested && inCanada && (
            <div className={styles.permitedSubstance}>
              <InputBaseLabel hasLeaf label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.IS_PERMITTED')} />
              {/* @ts-expect-error */}
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
              disabled={isNestedForm && !isProductEntered}
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

          {isNestedForm && !isReadOnly && (
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
      </Wrapper>
    </div>
  );
};

export default ProductDetails;

interface WrapperProps {
  collapsible: boolean;
  productId: ProductId;
  isExpanded?: boolean;
  children: ReactNode;
}

const Wrapper = ({ collapsible, productId, isExpanded, children }: WrapperProps) => {
  if (collapsible) {
    return (
      <Collapse id={`product_details-${productId}`} in={isExpanded} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    );
  }

  return children;
};
