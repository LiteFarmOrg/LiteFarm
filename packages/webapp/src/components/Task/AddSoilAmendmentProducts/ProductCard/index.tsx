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

import { ReactNode, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { GroupBase, SelectInstance } from 'react-select';
import SmallButton from '../../../Form/Button/SmallButton';
import ReactSelect, { CreatableSelect } from '../../../Form/ReactSelect';
import Input from '../../../Form/Input';
import ProductDetails, { type ProductDetailsProps } from './ProductDetails';
import { PRODUCT_FIELD_NAMES, type Product } from '../types';
import styles from '../styles.module.scss';

export type ProductCardProps = Omit<ProductDetailsProps, 'clearProduct'> & {
  namePrefix: string;
  system: 'metric' | 'imperial';
  onRemove?: () => void;
  onSaveProduct: ProductDetailsProps['onSave'];
  purposeOptions: { label: string; value: number }[];
  otherPurposeId?: number;
};

interface ProductOption {
  value: number | string;
  label: string;
  data: Omit<Product, 'product_id' | 'name'>;
}

type SelectRef = SelectInstance<ProductOption, false, GroupBase<ProductOption>>;

const formatOptionLabel = ({ label, data }: ProductOption): ReactNode => {
  const prefix = ['N', 'P', 'K'];
  const { n, p, k, npk_unit } = data || {};

  let npk = '';
  if (n || p || k) {
    if (npk_unit === 'ratio') {
      npk = [n, p, k].map((value) => value || 0).join(' : ');
    } else {
      npk = [n, p, k].map((value, index) => `${prefix[index]}: ${value || 0}%`).join(', ');
    }
  }

  return (
    <span className={styles.productOption}>
      <span key="name">{label}</span>
      <span key="npk">{npk}</span>
    </span>
  );
};

const SoilAmendmentProductCard = ({
  namePrefix,
  onRemove,
  system,
  onSaveProduct,
  isReadOnly,
  products = [],
  purposeOptions,
  otherPurposeId,
  ...props
}: ProductCardProps) => {
  const { t } = useTranslation();
  const { control, register, watch, setValue } = useFormContext();

  const PRODUCT_ID = `${namePrefix}.${PRODUCT_FIELD_NAMES.PRODUCT_ID}`;
  const PURPOSES = `${namePrefix}.${PRODUCT_FIELD_NAMES.PURPOSES}`;

  const purposes = watch(PURPOSES);

  const selectRef = useRef<SelectRef>(null);
  const productOptions = products.map(({ product_id, name, ...rest }) => {
    return { value: product_id, label: name, data: rest };
  });

  const clearProduct = () => {
    selectRef?.current?.clearValue();
  };

  return (
    <div className={styles.productCard}>
      {onRemove && <SmallButton onClick={onRemove} className={styles.removeButton} />}
      <Controller
        control={control}
        name={PURPOSES}
        rules={{ required: true }}
        render={({ field: { onChange, value: selectedOptions = [] } }) => (
          <ReactSelect
            isMulti
            value={purposeOptions.filter(({ value }) => selectedOptions.includes(value))}
            isDisabled={isReadOnly}
            label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.PURPOSE')}
            options={purposeOptions}
            onChange={(e) => {
              onChange(e);
              const newPurposes = e.map(({ value }) => value);
              setValue(PURPOSES, newPurposes, { shouldValidate: true });
            }}
          />
        )}
      />
      {purposes?.includes(otherPurposeId) && (
        <>
          {/* @ts-ignore */}
          <Input
            label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER_PURPOSE')}
            name={PRODUCT_FIELD_NAMES.OTHER_PURPOSE}
            disabled={isReadOnly}
            hookFormRegister={register(PRODUCT_FIELD_NAMES.OTHER_PURPOSE)}
            optional
          />
        </>
      )}
      <div>
        <Controller
          control={control}
          name={PRODUCT_ID}
          rules={{
            required: true,
            validate: (value) => {
              return typeof value === 'number';
            },
          }}
          render={({ field: { value, onChange } }) => (
            <CreatableSelect
              ref={selectRef}
              label={t('ADD_PRODUCT.PRODUCT_LABEL')}
              options={productOptions}
              onChange={(e) => onChange(e?.value)}
              placeholder={t('ADD_PRODUCT.PRESS_ENTER')}
              value={productOptions.find(({ value: id }) => id === value)}
              hasLeaf={true}
              isDisabled={isReadOnly}
              isClearable={false}
              formatOptionLabel={formatOptionLabel}
            />
          )}
        />
        <ProductDetails
          {...props}
          onSave={onSaveProduct}
          isReadOnly={isReadOnly}
          clearProduct={clearProduct}
          products={products}
        />
      </div>
      {/* TODO: LF-4249 <QuantityApplicationRate /> */}
    </div>
  );
};

export default SoilAmendmentProductCard;
