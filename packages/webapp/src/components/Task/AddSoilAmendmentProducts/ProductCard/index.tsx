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
import Input, { getInputErrors } from '../../../Form/Input';
import { Error } from '../../../Typography';
import ProductDetails, { type ProductDetailsProps } from './ProductDetails';
import { PRODUCT_FIELD_NAMES } from '../types';
import { ElementalUnit, type SoilAmendmentProduct } from '../../../../store/api/types';
import styles from '../styles.module.scss';
import QuantityApplicationRate, { Location } from '../QuantityApplicationRate';
import { hookFormMaxCharsValidation } from '../../../Form/hookformValidationUtils';

export type ProductCardProps = Omit<ProductDetailsProps, 'clearProduct' | 'onSave'> & {
  namePrefix: string;
  system: 'metric' | 'imperial';
  onRemove?: () => void;
  onSaveProduct: ProductDetailsProps['onSave'];
  purposeOptions: { label: string; value: number }[];
  otherPurposeId?: number;
  productNames: SoilAmendmentProduct['name'][];
  locations: Location[];
};

interface ProductOption {
  value: number | string;
  label: string;
  data: Omit<SoilAmendmentProduct, 'product_id' | 'name'>;
}

type SelectRef = SelectInstance<ProductOption, false, GroupBase<ProductOption>>;

const formatOptionLabel = ({ label, data }: ProductOption): ReactNode => {
  const prefix = ['N', 'P', 'K'];
  const { n, p, k, elemental_unit } = data?.soil_amendment_product || {};

  let npk: ReactNode = '';
  if ([n, p, k].some((value) => typeof value === 'number')) {
    if (elemental_unit === ElementalUnit.RATIO) {
      npk = [n, p, k].map((value) => value ?? '--').join(' : ');
    } else if (elemental_unit === ElementalUnit.PERCENT) {
      npk = (
        <>
          {[n, p, k].map((value, index, array) => {
            const formattedValue = typeof value === 'number' ? value + '%' : '--';
            return (
              <span key={index} className={styles.npkValue}>
                {prefix[index]}: {formattedValue}
                {index < array.length - 1 && ','}
              </span>
            );
          })}
        </>
      );
    }
  }

  return (
    <span className={styles.productOption}>
      <span key="name">{label}</span>
      <span className={styles.npkText} key="npk">
        {npk}
      </span>
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
  productNames = [],
  purposeOptions,
  otherPurposeId,
  locations,
  ...props
}: ProductCardProps) => {
  const { t } = useTranslation();
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const PRODUCT_ID = `${namePrefix}.${PRODUCT_FIELD_NAMES.PRODUCT_ID}`;
  const PURPOSES = `${namePrefix}.${PRODUCT_FIELD_NAMES.PURPOSES}`;
  const OTHER_PURPOSE = `${namePrefix}.${PRODUCT_FIELD_NAMES.OTHER_PURPOSE}`;
  const OTHER_PURPOSE_ID = `${namePrefix}.${PRODUCT_FIELD_NAMES.OTHER_PURPOSE_ID}`;

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
      {!isReadOnly && onRemove && (
        <SmallButton onClick={onRemove} className={styles.removeButton} />
      )}
      <div>
        <Controller
          control={control}
          name={PRODUCT_ID}
          rules={{
            required: true,
            validate: (value) => {
              if (typeof value === 'string' && productNames.includes(value.trim())) {
                return 'DUPLICATE_NAME';
              }
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
        {getInputErrors(errors, PRODUCT_ID) === 'DUPLICATE_NAME' ? (
          <Error>{t('ADD_TASK.DUPLICATE_NAME')}</Error>
        ) : (
          <ProductDetails
            {...props}
            onSave={onSaveProduct}
            isReadOnly={isReadOnly}
            clearProduct={clearProduct}
            products={products}
          />
        )}
      </div>
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
            style={{ paddingBottom: '12px' }} // TODO: remove after adding <QuantityApplicationRate />
          />
        )}
      />
      <input type="hidden" value={otherPurposeId} {...register(OTHER_PURPOSE_ID)} />

      {purposes?.includes(otherPurposeId) && (
        <>
          {/* @ts-ignore */}
          <Input
            label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER_PURPOSE')}
            name={OTHER_PURPOSE}
            disabled={isReadOnly}
            hookFormRegister={register(OTHER_PURPOSE, {
              shouldUnregister: true,
              maxLength: hookFormMaxCharsValidation(255),
            })}
            errors={getInputErrors(errors, OTHER_PURPOSE)}
            optional
          />
        </>
      )}
      <QuantityApplicationRate
        system={system}
        locations={locations}
        isReadOnly={isReadOnly}
        namePrefix={namePrefix}
      />
    </div>
  );
};

export default SoilAmendmentProductCard;
