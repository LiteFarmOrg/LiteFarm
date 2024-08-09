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
import { DetailsFields, type Option, type CommonDetailsProps } from './type';
import styles from './styles.module.scss';

export type UniqueDetailsProps = CommonDetailsProps & {
  tagTypeOptions: Option[DetailsFields.TAG_TYPE][];
  tagColorOptions: Option[DetailsFields.TAG_COLOR][];
  shouldShowTagTypeInput?: boolean;
};

const UniqueDetails = ({
  t,
  tagTypeOptions,
  tagColorOptions,
  shouldShowTagTypeInput,
}: UniqueDetailsProps) => {
  const {
    control,
    register,
    trigger,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={styles.sectionWrapper}>
      {/* @ts-ignore */}
      <Input
        type="text"
        label={t('common:NAME')}
        hookFormRegister={register(DetailsFields.NAME, {
          maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
        })}
        trigger={trigger}
        optional
        placeholder={t('ADD_ANIMAL.PLACEHOLDER.NAME')}
        errors={getInputErrors(errors, DetailsFields.NAME)}
      />
      {/* @ts-ignore */}
      <Input
        type="date"
        label={t('ANIMAL.ATTRIBUTE.DATE_OF_BIRTH')}
        hookFormRegister={register(DetailsFields.DATE_OF_BIRTH)}
        optional
      />
      {/* @ts-ignore */}
      <Input
        type="text"
        label={t('ANIMAL.ATTRIBUTE.TAG_NUMBER')}
        hookFormRegister={register(DetailsFields.TAG_NUMBER, {
          maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
        })}
        trigger={trigger}
        optional
        placeholder={t('ADD_ANIMAL.PLACEHOLDER.TAG_NUMBER')}
        errors={getInputErrors(errors, DetailsFields.TAG_NUMBER)}
      />
      <Controller
        control={control}
        name={DetailsFields.TAG_COLOR}
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
        name={DetailsFields.TAG_TYPE}
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
            hookFormRegister={register(DetailsFields.TAG_TYPE_INFO, {
              maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
            })}
            trigger={trigger}
            optional
            placeholder={t('ADD_ANIMAL.PLACEHOLDER.TAG_TYPE_INFO')}
            errors={getInputErrors(errors, DetailsFields.TAG_TYPE_INFO)}
          />
        </>
      )}
    </div>
  );
};

export default UniqueDetails;
