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

import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { GroupBase, SelectInstance } from 'react-select';
import SmallButton from '../../../Form/Button/SmallButton';
import { CreatableSelect } from '../../../Form/ReactSelect';
import ProductDetails, { ProductDetailsProps } from './ProductDetails';
import QuantityApplicationRate from './QuantityApplicationRate';
import useProductOptions from '../useProductOptions';
import styles from '../styles.module.scss';

export type ProductCardProps = Omit<ProductDetailsProps, 'clearProduct'> & {
  namePrefix: string;
  system: 'metric' | 'imperial';
  onRemove?: () => void;
  onSaveProduct: ProductDetailsProps['onSave'];
  totalArea: number;
};

interface ProductOption {
  value: number | string;
  label: JSX.Element;
}

type SelectRef = SelectInstance<ProductOption, false, GroupBase<ProductOption>>;

const SoilAmendmentProductCard = ({
  namePrefix,
  onRemove,
  system,
  onSaveProduct,
  isReadOnly,
  products,
  totalArea,
  ...props
}: ProductCardProps) => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  const PRODUCT_ID = `${namePrefix}.product_id`;

  const selectRef = useRef<SelectRef>(null);
  const productOptions = useProductOptions(products);

  const clearProduct = () => {
    selectRef?.current?.clearValue();
  };

  return (
    <div className={styles.productCard}>
      {onRemove && <SmallButton onClick={onRemove} />}
      <div>
        <Controller
          control={control}
          name={PRODUCT_ID}
          rules={{ required: true }}
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
      <QuantityApplicationRate
        namePrefix={namePrefix}
        system={system}
        isReadOnly={isReadOnly}
        totalArea={totalArea}
      />
    </div>
  );
};

export default SoilAmendmentProductCard;
