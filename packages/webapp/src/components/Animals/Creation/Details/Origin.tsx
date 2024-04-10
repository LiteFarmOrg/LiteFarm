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
import { useTranslation } from 'react-i18next';
import Input from '../../../Form/Input';
import RadioGroup from '../../../Form/RadioGroup';
import styles from './styles.module.scss';

type ReactSelectOption = {
  label: string;
  value: string | number;
};

// TODO
export type OriginProps = {
  control: any;
  register: any;
  watch: any;
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

const Origin = ({ control, watch, register, currency, originOptions }: OriginProps) => {
  const { t } = useTranslation(['translation', 'common', 'animal']);
  const originId = watch(ADD_ANIMAL.ORIGIN);

  const fields = useMemo(() => {
    return originId === 1 ? (
      <>
        {/* @ts-ignore */}
        <Input
          key={ADD_ANIMAL.BROUGHT_IN_DATE}
          type="date"
          label={t('common:DATE')}
          hookFormRegister={register(ADD_ANIMAL.BROUGHT_IN_DATE)} // TODO: max length?
          optional
        />
        {/* @ts-ignore */}
        <Input
          key={ADD_ANIMAL.MERCHANT}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.MERCHANT')}
          hookFormRegister={register(ADD_ANIMAL.MERCHANT)} // TODO: max length?
          optional
          placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.MERCHANT')}
        />
        {/* @ts-ignore */}
        <Input
          key={ADD_ANIMAL.PRICE}
          type="number"
          currency={currency}
          label={t('common:PRICE')}
          hookFormRegister={register(ADD_ANIMAL.PRICE)} // TODO: max length?
          optional
          placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.PRICE')}
        />
      </>
    ) : (
      <>
        {/* @ts-ignore */}
        <Input
          key={ADD_ANIMAL.DAM}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.DAM')}
          hookFormRegister={register(ADD_ANIMAL.DAM)} // TODO: max length?
          optional
          placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.DAM')}
        />
        {/* @ts-ignore */}
        <Input
          key={ADD_ANIMAL.SIRE}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.SIRE')}
          hookFormRegister={register(ADD_ANIMAL.SIRE)} // TODO: max length?
          optional
          placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.SIRE')}
        />
      </>
    );
  }, [originId]);

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
