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
import { TFunction } from 'react-i18next';
import Input, { getInputErrors } from '../../../Form/Input';
import RadioGroup from '../../../Form/RadioGroup';
import ReactSelect from '../../../Form/ReactSelect';
import InputBaseLabel from '../../../Form/InputBase/InputBaseLabel';
import { AnimalOrBatchKeys, AnimalSexes } from '../../../../containers/Animals/types';
import styles from './styles.module.scss';

// TODO
type ReactSelectOption = {
  label: string;
  value: string | number;
};

// TODO
export type GeneralDetailsProps = {
  formMethods: {
    control: any;
    register: any;
    watch: any;
    formState: { errors: any };
  };
  t: TFunction;
  types: ReactSelectOption[];
  breeds: ReactSelectOption[];
  sexes: ReactSelectOption[];
  uses: ReactSelectOption[];
  animalOrBatch: AnimalOrBatchKeys;
};

// TODO: move up
export enum ADD_ANIMAL {
  NAME = 'name',
  TYPE = 'type',
  BREED = 'breed',
  SEX = 'sex',
  USED_FOR_PRODUCTION = 'used_for_production',
  USE = 'use',
}

const GeneralDetails = ({
  t,
  formMethods,
  types,
  breeds,
  sexes,
  uses,
  animalOrBatch,
}: GeneralDetailsProps) => {
  const {
    control,
    watch,
    register,
    formState: { errors },
  } = formMethods;

  const sex = watch(ADD_ANIMAL.SEX);

  const sexInputs = useMemo(() => {
    if (animalOrBatch === AnimalOrBatchKeys.ANIMAL) {
      return (
        <>
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
        </>
      );
    }

    return 'TODO: LF-4159';
  }, [animalOrBatch, t, sexes, control]);

  return (
    <div className={styles.sectionWrapper}>
      {animalOrBatch === AnimalOrBatchKeys.BATCH && (
        <>
          {/* @ts-ignore */}
          <Input
            type="text"
            label={t('ANIMAL.ATTRIBUTE.BATCH_NAME')}
            hookFormRegister={register(ADD_ANIMAL.NAME, {
              maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
            })}
            optional
            placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.BATCH_NAME')}
            errors={getInputErrors(errors, ADD_ANIMAL.NAME)}
          />
        </>
      )}
      <Controller
        control={control}
        name={ADD_ANIMAL.TYPE}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            // @ts-ignore
            label={t('ANIMAL.ANIMAL_TYPE')}
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
      {sexInputs}
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

export default GeneralDetails;
