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
import { useFormContext } from 'react-hook-form';
import Input, { getInputErrors } from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import {
  DetailsFields,
  type Option,
  type CommonDetailsProps,
} from '../../../containers/Animals/AddAnimals/types';
import { AnimalOrigins } from '../../../containers/Animals/types';
import styles from './styles.module.scss';

export type OriginProps = CommonDetailsProps & {
  currency: string;
  originOptions: Option[DetailsFields.ORIGIN][];
};

const Origin = ({ t, currency, originOptions, namePrefix = '', mode = 'add' }: OriginProps) => {
  const {
    control,
    register,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext();

  const watchedOrigin = watch(`${namePrefix}${DetailsFields.ORIGIN}`);

  const getOriginEnum = (watchedOrigin: number): AnimalOrigins => {
    const originOption = originOptions.find((option) => option.value === watchedOrigin);
    return AnimalOrigins[originOption?.key as keyof typeof AnimalOrigins];
  };

  const origin = !watchedOrigin ? undefined : getOriginEnum(watchedOrigin);

  const fields = useMemo(() => {
    return origin === AnimalOrigins.BROUGHT_IN ? (
      <>
        {/* @ts-ignore */}
        <Input
          key={DetailsFields.BROUGHT_IN_DATE}
          type="date"
          label={t('common:DATE')}
          hookFormRegister={register(`${namePrefix}${DetailsFields.BROUGHT_IN_DATE}`)}
          optional
          disabled={mode === 'readonly'}
        />
        {/* @ts-ignore */}
        <Input
          key={DetailsFields.SUPPLIER}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.SUPPLIER')}
          hookFormRegister={register(`${namePrefix}${DetailsFields.SUPPLIER}`, {
            maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
          })}
          trigger={trigger}
          optional
          placeholder={t('ADD_ANIMAL.PLACEHOLDER.SUPPLIER')}
          errors={getInputErrors(errors, `${namePrefix}${DetailsFields.SUPPLIER}`)}
          disabled={mode === 'readonly'}
        />
        {/* @ts-ignore */}
        <Input
          key={DetailsFields.PRICE}
          type="number"
          currency={currency}
          label={t('common:PRICE')}
          hookFormRegister={register(`${namePrefix}${DetailsFields.PRICE}`)}
          max={9999999999}
          optional
          placeholder={t('ADD_ANIMAL.PLACEHOLDER.PRICE')}
          errors={getInputErrors(errors, `${namePrefix}${DetailsFields.PRICE}`)}
          disabled={mode === 'readonly'}
        />
      </>
    ) : (
      <>
        {/* @ts-ignore */}
        <Input
          key={DetailsFields.DAM}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.DAM')}
          hookFormRegister={register(`${namePrefix}${DetailsFields.DAM}`, {
            maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
          })}
          trigger={trigger}
          optional
          placeholder={t('ADD_ANIMAL.PLACEHOLDER.DAM')}
          errors={getInputErrors(errors, `${namePrefix}${DetailsFields.DAM}`)}
          disabled={mode === 'readonly'}
        />
        {/* @ts-ignore */}
        <Input
          key={DetailsFields.SIRE}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.SIRE')}
          hookFormRegister={register(`${namePrefix}${DetailsFields.SIRE}`, {
            maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
          })}
          trigger={trigger}
          optional
          placeholder={t('ADD_ANIMAL.PLACEHOLDER.SIRE')}
          errors={getInputErrors(errors, `${namePrefix}${DetailsFields.SIRE}`)}
          disabled={mode === 'readonly'}
        />
      </>
    );
  }, [origin, Object.entries(errors)]);

  return (
    <div className={styles.sectionWrapper}>
      {/* @ts-ignore */}
      <Input
        type="date"
        label={t('ANIMAL.ATTRIBUTE.DATE_OF_BIRTH')}
        hookFormRegister={register(`${namePrefix}${DetailsFields.DATE_OF_BIRTH}`)}
        optional
        disabled={mode === 'readonly'}
      />
      <div>
        {/* @ts-ignore */}
        <RadioGroup
          name={`${namePrefix}${DetailsFields.ORIGIN}`}
          radios={originOptions}
          hookFormControl={control}
          row
          disabled={mode === 'readonly'}
        />
      </div>
      {origin && fields}
    </div>
  );
};

export default Origin;
