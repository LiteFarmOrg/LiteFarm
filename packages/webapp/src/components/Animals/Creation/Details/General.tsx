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

import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import RadioGroup from '../../../Form/RadioGroup';
import ReactSelect from '../../../Form/ReactSelect';
import InputBaseLabel from '../../../Form/InputBase/InputBaseLabel';
import { AnimalSexes } from '../../../../containers/Animals/types';
import styles from './styles.module.scss';

// TODO
type ReactSelectOption = {
  label: string;
  value: string | number;
};

// TODO
export type GeneralDetailProps = {
  control: any;
  watch: any;
  types: ReactSelectOption[];
  breeds: ReactSelectOption[];
  sexes: ReactSelectOption[];
  uses: ReactSelectOption[];
};

// TODO: move up
export enum ADD_ANIMAL {
  TYPE = 'type',
  BREED = 'breed',
  SEX = 'sex',
  USED_FOR_PRODUCTION = 'used_for_production',
  USE = 'use',
}

const GeneralDetail = ({ control, watch, types, breeds, sexes, uses }: GeneralDetailProps) => {
  const { t } = useTranslation(['translation', 'common']);
  const sex = watch(ADD_ANIMAL.SEX);

  return (
    <div className={styles.sectionWrapper}>
      <Controller
        control={control}
        name={ADD_ANIMAL.TYPE}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('ANIMAL.ANIMAL_TYPE')}
            optional
            value={value}
            onChange={onChange}
            options={types}
          />
        )}
      />
      <Controller
        control={control}
        name={ADD_ANIMAL.BREED}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('ANIMAL.ANIMAL_BREED')}
            optional
            value={value}
            onChange={onChange}
            options={breeds}
          />
        )}
      />
      <div>
        <InputBaseLabel optional label={t('ANIMAL.ANIMAL_SEXES')} />
        {/* @ts-ignore */}
        <RadioGroup name={ADD_ANIMAL.SEX} radios={sexes} hookFormControl={control} row />
      </div>
      {sex ===
        sexes.find(({ label }) => {
          return label.toLowerCase() === AnimalSexes.MALE.toLowerCase();
        })?.value && (
        <div>
          <InputBaseLabel optional label={t('ANIMAL.ADD_ANIMAL.USED_FOR_REPRODUCTION')} />
          {/* @ts-ignore */}
          <RadioGroup name={ADD_ANIMAL.USED_FOR_PRODUCTION} hookFormControl={control} row />
        </div>
      )}
      <Controller
        control={control}
        name={ADD_ANIMAL.USE}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('common:USE')}
            optional
            isMulti
            value={value}
            onChange={onChange}
            options={uses}
          />
        )}
      />
    </div>
  );
};

export default GeneralDetail;
