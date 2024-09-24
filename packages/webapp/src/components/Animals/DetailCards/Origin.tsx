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

import React, { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Input, { getInputErrors } from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import { isNotInFuture, parseISOStringToLocalDate } from '../../Form/Input/utils';
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

const Origin = ({ t, currency, originOptions, namePrefix = '' }: OriginProps) => {
  const {
    control,
    register,
    trigger,
    watch,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const [isBirthDateValid, setIsBirthDateValid] = useState(true);
  const [isBroughtInDateValid, setIsBroughtInDateValid] = useState(true);

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
          hookFormRegister={register(`${namePrefix}${DetailsFields.BROUGHT_IN_DATE}`, {
            validate: (value) => {
              if (value === '' && isBroughtInDateValid) return true;
              return !isNaN(new Date(value).valueOf())
                ? isNotInFuture(value)
                : t('common:INVALID_DATE');
            },
          })}
          onCleared={() => {
            setIsBroughtInDateValid(true);
            clearErrors(`${namePrefix}${DetailsFields.BROUGHT_IN_DATE}`);
          }}
          onKeyUp={(e: any) => {
            setIsBroughtInDateValid(!e.target.validity.badInput);
          }}
          errors={getInputErrors(errors, `${namePrefix}${DetailsFields.BROUGHT_IN_DATE}`)}
          optional
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
        hookFormRegister={register(`${namePrefix}${DetailsFields.DATE_OF_BIRTH}`, {
          validate: (value) => {
            if (value === '' && isBirthDateValid) return true;
            return !isNaN(new Date(value).valueOf())
              ? isNotInFuture(value)
              : t('common:INVALID_DATE');
          },
        })}
        onCleared={() => {
          setIsBirthDateValid(true);
          clearErrors(`${namePrefix}${DetailsFields.DATE_OF_BIRTH}`);
        }}
        onKeyUp={(e: React.ChangeEvent<HTMLInputElement>): void => {
          setIsBirthDateValid(!e.target.validity.badInput);
        }}
        errors={getInputErrors(errors, `${namePrefix}${DetailsFields.DATE_OF_BIRTH}`)}
        optional
      />
      <div>
        {/* @ts-ignore */}
        <RadioGroup
          name={`${namePrefix}${DetailsFields.ORIGIN}`}
          radios={originOptions}
          hookFormControl={control}
          row
        />
      </div>
      {origin && fields}
    </div>
  );
};

export default Origin;
