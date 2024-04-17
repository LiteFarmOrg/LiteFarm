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
import { Controller } from 'react-hook-form';
import ReactSelect from '../../../Form/ReactSelect';
import Input, { getInputErrors } from '../../../Form/Input';
import { DetailsFields, type FormValues, type CommonDetailsProps } from './type';
import styles from './styles.module.scss';

export type UniqueDetailsProps = CommonDetailsProps & {
  tagTypes: FormValues[DetailsFields.TAG_TYPE][];
  tagColors: FormValues[DetailsFields.TAG_COLOR][];
  tagPlacements: FormValues[DetailsFields.TAG_PLACEMENT][];
};

const UniqueDetails = ({
  t,
  formMethods,
  tagTypes,
  tagColors,
  tagPlacements,
}: UniqueDetailsProps) => {
  const {
    control,
    watch,
    register,
    formState: { errors },
  } = formMethods;

  const animalType = watch(DetailsFields.TYPE);
  const tagPlacement = watch(DetailsFields.TAG_PLACEMENT);

  const tagPlacementOptions = useMemo(() => {
    // TODO
    if (animalType.value === 'defaultType') {
    } else {
      return [
        { label: t('animal:TAG_PLACEMENT.LEFT_EAR'), value: 'LEFT_EAR' },
        { label: t('animal:TAG_PLACEMENT.RIGHT_EAR'), value: 'RIGHT_EAR' },
        { label: t('animal:TAG_PLACEMENT.LEFT_LEG'), value: 'LEFT_LEG' },
        { label: t('animal:TAG_PLACEMENT.RIGHT_LEG'), value: 'RIGHT_LEG' },
        { label: t('common:OTHER'), value: 'OTHER' },
      ];
    }
  }, [animalType, tagPlacements]);

  return (
    <div className={styles.sectionWrapper}>
      {/* @ts-ignore */}
      <Input
        type="text"
        label={t('common:NAME')}
        hookFormRegister={register(DetailsFields.NAME, {
          maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
        })}
        optional
        placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.NAME')}
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
        optional
        placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.TAG_NUMBER')}
        errors={getInputErrors(errors, DetailsFields.TAG_NUMBER)}
      />
      <Controller
        control={control}
        name={DetailsFields.TAG_TYPE}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('ANIMAL.ATTRIBUTE.TAG_TYPE')}
            optional
            value={value}
            onChange={onChange}
            options={tagTypes}
            placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.TAG_TYPE')}
          />
        )}
      />
      <Controller
        control={control}
        name={DetailsFields.TAG_COLOR}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('ANIMAL.ATTRIBUTE.TAG_COLOUR')}
            optional
            value={value}
            onChange={onChange}
            options={tagColors}
            placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.TAG_COLOUR')}
          />
        )}
      />
      <Controller
        control={control}
        name={DetailsFields.TAG_PLACEMENT}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('ANIMAL.ATTRIBUTE.TAG_PLACEMENT')}
            optional
            value={value}
            onChange={onChange}
            options={tagPlacementOptions}
            placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.TAG_PLACEMENT')}
          />
        )}
      />
      {tagPlacement?.value === 'OTHER' && (
        <>
          {/* @ts-ignore */}
          <Input
            type="text"
            label={t('ANIMAL.ATTRIBUTE.TAG_PLACEMENT_INFO')}
            hookFormRegister={register(DetailsFields.TAG_PLACEMENT_INFO, {
              maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
            })}
            optional
            placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.TAG_PLACEMENT_INFO')}
            errors={getInputErrors(errors, DetailsFields.TAG_PLACEMENT_INFO)}
          />
        </>
      )}
    </div>
  );
};

export default UniqueDetails;
