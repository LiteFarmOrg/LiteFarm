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
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { GroupBase, SelectInstance } from 'react-select';
import { CreatableSelect } from '../../Form/ReactSelect';
import useProductOptions from './useProductOptions';
import ProductDetails from './ProductDetails';
import { FIELD_NAMES, type FormFields, type Product } from './types';
import { Unit } from '../../Form/CompositionInputs/NumberInputWithSelect';

interface ProductOption {
  value: number | string;
  label: JSX.Element;
}

type SelectRef = SelectInstance<ProductOption, false, GroupBase<ProductOption>>;

export type ProductInfoProps = {
  defaultProductId: number;
  products?: Product[];
  farm: { farm_id: string; interested: boolean; country_id: number };
  isExpanded: boolean;
  toggleExpanded: () => void;
  expand: () => void;
  isReadOnly?: boolean;
  onSave: (data: FormFields & { farm_id: string }) => void;
};

const isNewProduct = (productId: FormFields['product_id']): boolean => {
  return typeof productId === 'string';
};

const defaultValues = {
  [FIELD_NAMES.PRODUCT_ID]: undefined,
  [FIELD_NAMES.SUPPLIER]: '',
  [FIELD_NAMES.COMPOSITION]: {
    [FIELD_NAMES.UNIT]: Unit.PERCENT,
    [FIELD_NAMES.N]: NaN,
    [FIELD_NAMES.P]: NaN,
    [FIELD_NAMES.K]: NaN,
  },
};

const ProductInfo = ({
  defaultProductId,
  products = [],
  farm,
  isExpanded,
  toggleExpanded,
  expand,
  isReadOnly = false,
  onSave,
}: ProductInfoProps) => {
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  const formMethods = useForm<FormFields>({
    mode: 'onBlur',
    defaultValues,
  });

  const { getValues, watch, control, handleSubmit, reset, setFocus, trigger } = formMethods;

  const { t } = useTranslation();
  const selectRef = useRef<SelectRef>(null);
  const productId = watch(FIELD_NAMES.PRODUCT_ID);

  const productOptions = useProductOptions(products);

  useEffect(() => {
    setProduct(defaultProductId);
  }, []);

  const setProduct = (newProductId: FormFields['product_id']) => {
    const selectedProduct = products.find(({ product_id }) => product_id === newProductId);
    const { supplier, on_permitted_substances_list, n, p, k, npk_unit } = selectedProduct || {};

    const wasAddingNewProduct = isNewProduct(productId);
    const isAddingNewProduct = !!(newProductId && !selectedProduct);
    const shouldNotResetFields = wasAddingNewProduct && isAddingNewProduct;

    if (!newProductId || !shouldNotResetFields) {
      reset({
        [FIELD_NAMES.PRODUCT_ID]: newProductId,
        [FIELD_NAMES.SUPPLIER]: supplier || '',
        [FIELD_NAMES.PERMITTED]: on_permitted_substances_list || undefined,
        [FIELD_NAMES.COMPOSITION]: {
          [FIELD_NAMES.UNIT]: npk_unit || Unit.PERCENT,
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

    if (newProductId) {
      // Wait for the card to be expaneded
      setTimeout(() => {
        setFocus(FIELD_NAMES.SUPPLIER);
      }, 0);
    }

    trigger();
  };

  const clearProduct = () => {
    selectRef?.current?.clearValue();
  };

  const onCancel = () => {
    if (isNewProduct(productId)) {
      clearProduct();
      setProduct(undefined);
    } else {
      reset();
      setIsEditingProduct(false);
    }
  };

  const onSubmit = (data: FormFields) => {
    setIsEditingProduct(false);
    reset(getValues());

    onSave({ ...data, farm_id: farm.farm_id });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Controller
          control={control}
          name={FIELD_NAMES.PRODUCT_ID}
          rules={{ required: true }}
          render={({ field: { value } }) => (
            <CreatableSelect
              ref={selectRef}
              label={t('ADD_PRODUCT.PRODUCT_LABEL')}
              options={productOptions}
              onChange={(e) => setProduct(e?.value)}
              placeholder={t('ADD_PRODUCT.PRESS_ENTER')}
              value={productOptions.find(({ value: id }) => id === value)}
              hasLeaf={true}
              isDisabled={isReadOnly}
              isClearable={false}
            />
          )}
        />
        <FormProvider {...formMethods}>
          <ProductDetails
            isReadOnly={isReadOnly}
            isExpanded={isExpanded}
            isProductEntered={!!productId}
            isEditingProduct={isEditingProduct}
            toggleExpanded={toggleExpanded}
            onCancel={onCancel}
            onEdit={() => setIsEditingProduct(true)}
            farm={farm}
          />
        </FormProvider>
      </div>
    </form>
  );
};

export default ProductInfo;
