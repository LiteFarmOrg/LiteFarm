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

import { useMemo } from 'react';
import { TFunction } from 'react-i18next';
import Input, { getInputErrors } from '../../../Form/Input';
import RadioGroup from '../../../Form/RadioGroup';
import styles from './styles.module.scss';

type ReactSelectOption = {
  label: string;
  value: string | number;
};

// TODO
export type OriginProps = {
  formMethods: {
    control: any;
    register: any;
    watch: any;
    formState: { errors: any };
  };
  t: TFunction;
  currency: string;
  originOptions: ReactSelectOption[];
};

// TODO: move up
export enum ADD_ANIMAL {
  ORIGIN = 'origin_id',
  DAM = 'dam',
  SIRE = 'sire',
  BROUGHT_IN_DATE = 'brought_in_date',
  MERCHANT = 'merchant', // TODO
  PRICE = 'price', // TODO
}

const Origin = ({ t, formMethods, currency, originOptions }: OriginProps) => {
  const {
    control,
    watch,
    register,
    formState: { errors },
  } = formMethods;
  const originId = watch(ADD_ANIMAL.ORIGIN);

  const fields = useMemo(() => {
    return originId === 1 ? (
      <>
        {/* @ts-ignore */}
        <Input
          key={ADD_ANIMAL.BROUGHT_IN_DATE}
          type="date"
          label={t('common:DATE')}
          hookFormRegister={register(ADD_ANIMAL.BROUGHT_IN_DATE)}
          optional
        />
        {/* @ts-ignore */}
        <Input
          key={ADD_ANIMAL.MERCHANT}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.MERCHANT')}
          hookFormRegister={register(ADD_ANIMAL.MERCHANT, {
            maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
          })}
          optional
          placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.MERCHANT')}
          errors={getInputErrors(errors, ADD_ANIMAL.MERCHANT)}
        />
        {/* @ts-ignore */}
        <Input
          key={ADD_ANIMAL.PRICE}
          type="number"
          currency={currency}
          label={t('common:PRICE')}
          hookFormRegister={register(ADD_ANIMAL.PRICE)}
          max={9999999999}
          optional
          placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.PRICE')}
          errors={getInputErrors(errors, ADD_ANIMAL.PRICE)}
        />
      </>
    ) : (
      <>
        {/* @ts-ignore */}
        <Input
          key={ADD_ANIMAL.DAM}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.DAM')}
          hookFormRegister={register(ADD_ANIMAL.DAM, {
            maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
          })}
          optional
          placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.DAM')}
          errors={getInputErrors(errors, ADD_ANIMAL.DAM)}
        />
        {/* @ts-ignore */}
        <Input
          key={ADD_ANIMAL.SIRE}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.SIRE')}
          hookFormRegister={register(ADD_ANIMAL.SIRE, {
            maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
          })}
          optional
          placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.SIRE')}
          errors={getInputErrors(errors, ADD_ANIMAL.SIRE)}
        />
      </>
    );
  }, [originId, Object.entries(errors)]);

  return (
    <div className={styles.sectionWrapper}>
      <div>
        {/* @ts-ignore */}
        <RadioGroup name={ADD_ANIMAL.ORIGIN} radios={originOptions} hookFormControl={control} row />
      </div>
      {originId && fields}
    </div>
  );
};

export default Origin;
