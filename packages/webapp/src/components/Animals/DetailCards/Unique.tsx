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

import { Controller, useFormContext } from 'react-hook-form';
import ReactSelect from '../../Form/ReactSelect';
import Input, { getInputErrors } from '../../Form/Input';
import {
  DetailsFields,
  type Option,
  type CommonDetailsProps,
} from '../../../containers/Animals/AddAnimals/types';
import styles from './styles.module.scss';

export type UniqueDetailsProps = CommonDetailsProps & {
  tagTypeOptions: Option[DetailsFields.TAG_TYPE][];
  tagColorOptions: Option[DetailsFields.TAG_COLOR][];
};

const UniqueDetails = ({
  t,
  tagTypeOptions,
  tagColorOptions,
  namePrefix = '',
}: UniqueDetailsProps) => {
  const {
    control,
    register,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext();

  const watchedTagType = watch(`${namePrefix}${DetailsFields.TAG_TYPE}`);
  const shouldShowTagTypeInput = watchedTagType?.key === 'OTHER';

  return (
    <div className={styles.sectionWrapper}>
      {/* @ts-ignore */}
      <Input
        type="text"
        label={t('common:NAME')}
        hookFormRegister={register(`${namePrefix}${DetailsFields.NAME}`, {
          maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
        })}
        trigger={trigger}
        optional
        placeholder={t('ADD_ANIMAL.PLACEHOLDER.NAME')}
        errors={getInputErrors(errors, `${namePrefix}${DetailsFields.NAME}`)}
      />
      {/* @ts-ignore */}
      <Input
        type="date"
        label={t('ANIMAL.ATTRIBUTE.DATE_OF_BIRTH')}
        hookFormRegister={register(`${namePrefix}${DetailsFields.DATE_OF_BIRTH}`)}
        optional
      />
      {/* @ts-ignore */}
      <Input
        type="text"
        label={t('ANIMAL.ATTRIBUTE.TAG_NUMBER')}
        hookFormRegister={register(`${namePrefix}${DetailsFields.TAG_NUMBER}`, {
          maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
        })}
        trigger={trigger}
        optional
        placeholder={t('ADD_ANIMAL.PLACEHOLDER.TAG_NUMBER')}
        errors={getInputErrors(errors, `${namePrefix}${DetailsFields.TAG_NUMBER}`)}
      />
      <Controller
        control={control}
        name={`${namePrefix}${DetailsFields.TAG_COLOR}`}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('ANIMAL.ATTRIBUTE.TAG_COLOUR')}
            optional
            value={value}
            onChange={onChange}
            options={tagColorOptions}
            placeholder={t('ADD_ANIMAL.PLACEHOLDER.TAG_COLOUR')}
          />
        )}
      />
      <Controller
        control={control}
        name={`${namePrefix}${DetailsFields.TAG_TYPE}`}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('ANIMAL.ATTRIBUTE.TAG_TYPE')}
            optional
            value={value}
            onChange={onChange}
            options={tagTypeOptions}
            placeholder={t('ADD_ANIMAL.PLACEHOLDER.TAG_TYPE')}
          />
        )}
      />
      {shouldShowTagTypeInput && (
        <>
          {/* @ts-ignore */}
          <Input
            type="text"
            hookFormRegister={register(`${namePrefix}${DetailsFields.TAG_TYPE_INFO}`, {
              maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
            })}
            trigger={trigger}
            optional
            placeholder={t('ADD_ANIMAL.PLACEHOLDER.TAG_TYPE_INFO')}
            errors={getInputErrors(errors, `${namePrefix}${DetailsFields.TAG_TYPE_INFO}`)}
          />
        </>
      )}
    </div>
  );
};

export default UniqueDetails;
