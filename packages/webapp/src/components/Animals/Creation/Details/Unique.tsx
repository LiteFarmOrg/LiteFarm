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
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../../Form/ReactSelect';
import styles from './styles.module.scss';
import Input from '../../../Form/Input';

// TODO
type ReactSelectOption = {
  label: string;
  value: string | number;
};

// TODO
export type UniqueDetailsProps = {
  control: any;
  register: any;
  watch: any;
  identifierTypes: ReactSelectOption[];
  identifierColors: ReactSelectOption[];
  identifierPlacements: ReactSelectOption[];
};

// TODO: move up
export enum ADD_ANIMAL {
  NAME = 'name',
  DATE_OF_BIRTH = 'birth_date',
  TAG_NUMBER = 'identifier',
  TAG_TYPE = 'identifier_type', // TODO
  TAG_COLOR = 'identifier_color_id',
  TAG_PLACEMENT = 'identifier_placement_id',
  TAG_PLACEMENT_INFO = 'identifier_placement_info',
}

const UniqueDetails = ({
  control,
  watch,
  register,
  identifierTypes,
  identifierColors,
  identifierPlacements,
}: UniqueDetailsProps) => {
  const { t } = useTranslation(['translation', 'common', 'animal']);
  const animalType = watch('type');
  const tagPlacement = watch(ADD_ANIMAL.TAG_PLACEMENT);

  const tagPlacements = useMemo(() => {
    // TODO
    if (animalType === 'defaultType') {
    } else {
      return [
        { label: t('animal:TAG_PLACEMENT.LEFT_EAR'), value: 'LEFT_EAR' },
        { label: t('animal:TAG_PLACEMENT.RIGHT_EAR'), value: 'RIGHT_EAR' },
        { label: t('animal:TAG_PLACEMENT.LEFT_LEG'), value: 'LEFT_LEG' },
        { label: t('animal:TAG_PLACEMENT.RIGHT_LEG'), value: 'RIGHT_LEG' },
        { label: t('common:OTHER'), value: 'OTHER' },
      ];
    }
  }, [animalType, identifierPlacements]);

  return (
    <div className={styles.sectionWrapper}>
      {/* @ts-ignore */}
      <Input
        type="text"
        label={t('common:NAME')}
        hookFormRegister={register(ADD_ANIMAL.NAME)} // TODO: max length?
        optional
        placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.NAME')}
      />
      {/* @ts-ignore */}
      <Input
        type="date"
        label={t('ANIMAL.ATTRIBUTE.DATE_OF_BIRTH')}
        hookFormRegister={register(ADD_ANIMAL.DATE_OF_BIRTH)} // TODO: max length?
        optional
      />
      {/* @ts-ignore */}
      <Input
        type="text"
        label={t('ANIMAL.ATTRIBUTE.TAG_NUMBER')}
        hookFormRegister={register(ADD_ANIMAL.TAG_NUMBER)} // TODO: max length?
        optional
        placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.TAG_NUMBER')}
      />
      <Controller
        control={control}
        name={ADD_ANIMAL.TAG_TYPE}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('ANIMAL.ATTRIBUTE.TAG_TYPE')}
            optional
            value={value}
            onChange={onChange}
            options={identifierTypes}
            placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.TAG_TYPE')}
          />
        )}
      />
      <Controller
        control={control}
        name={ADD_ANIMAL.TAG_COLOR}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('ANIMAL.ATTRIBUTE.TAG_COLOUR')}
            optional
            value={value}
            onChange={onChange}
            options={identifierColors}
            placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.TAG_COLOUR')}
          />
        )}
      />
      <Controller
        control={control}
        name={ADD_ANIMAL.TAG_PLACEMENT}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('ANIMAL.ATTRIBUTE.TAG_PLACEMENT')}
            optional
            value={value}
            onChange={onChange}
            options={tagPlacements}
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
            hookFormRegister={register(ADD_ANIMAL.TAG_PLACEMENT_INFO)} // TODO: max length?
            optional
            placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.TAG_PLACEMENT_INFO')}
          />
        </>
      )}
    </div>
  );
};

export default UniqueDetails;
