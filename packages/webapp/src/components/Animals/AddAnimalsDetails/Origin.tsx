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
import Input, { getInputErrors } from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import { DetailsFields, type Option, type CommonDetailsProps } from './type';
import { AnimalOrigins } from '../../../containers/Animals/types';
import styles from './styles.module.scss';

export type OriginProps = CommonDetailsProps & {
  currency: string;
  originOptions: Option[DetailsFields.ORIGIN][];
  origin?: AnimalOrigins;
};

const Origin = ({ t, formMethods, currency, originOptions, origin }: OriginProps) => {
  const {
    control,
    register,
    trigger,
    formState: { errors },
  } = formMethods;

  const fields = useMemo(() => {
    return origin === AnimalOrigins.BROUGHT_IN ? (
      <>
        {/* @ts-ignore */}
        <Input
          key={DetailsFields.BROUGHT_IN_DATE}
          type="date"
          label={t('common:DATE')}
          hookFormRegister={register(DetailsFields.BROUGHT_IN_DATE)}
          optional
        />
        {/* @ts-ignore */}
        <Input
          key={DetailsFields.MERCHANT}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.MERCHANT')}
          hookFormRegister={register(DetailsFields.MERCHANT, {
            maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
          })}
          trigger={trigger}
          optional
          placeholder={t('ADD_ANIMAL.PLACEHOLDER.MERCHANT')}
          errors={getInputErrors(errors, DetailsFields.MERCHANT)}
        />
        {/* @ts-ignore */}
        <Input
          key={DetailsFields.PRICE}
          type="number"
          currency={currency}
          label={t('common:PRICE')}
          hookFormRegister={register(DetailsFields.PRICE)}
          max={9999999999}
          optional
          placeholder={t('ADD_ANIMAL.PLACEHOLDER.PRICE')}
          errors={getInputErrors(errors, DetailsFields.PRICE)}
        />
      </>
    ) : (
      <>
        {/* @ts-ignore */}
        <Input
          key={DetailsFields.DAM}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.DAM')}
          hookFormRegister={register(DetailsFields.DAM, {
            maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
          })}
          trigger={trigger}
          optional
          placeholder={t('ADD_ANIMAL.PLACEHOLDER.DAM')}
          errors={getInputErrors(errors, DetailsFields.DAM)}
        />
        {/* @ts-ignore */}
        <Input
          key={DetailsFields.SIRE}
          type="text"
          label={t('ANIMAL.ATTRIBUTE.SIRE')}
          hookFormRegister={register(DetailsFields.SIRE, {
            maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
          })}
          trigger={trigger}
          optional
          placeholder={t('ADD_ANIMAL.PLACEHOLDER.SIRE')}
          errors={getInputErrors(errors, DetailsFields.SIRE)}
        />
      </>
    );
  }, [origin, Object.entries(errors)]);

  return (
    <div className={styles.sectionWrapper}>
      <div>
        {/* @ts-ignore */}
        <RadioGroup
          name={DetailsFields.ORIGIN}
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
