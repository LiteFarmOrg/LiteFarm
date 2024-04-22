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
import Input, { getInputErrors } from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import ReactSelect from '../../Form/ReactSelect';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import { AnimalOrBatchKeys } from '../../../containers/Animals/types';
import { DetailsFields, type Option, type CommonDetailsProps } from './type';
import styles from './styles.module.scss';

export type GeneralDetailsProps = CommonDetailsProps & {
  typeOptions: Option[DetailsFields.TYPE][];
  breedOptions: Option[DetailsFields.BREED][];
  sexOptions: Option[DetailsFields.SEX][];
  useOptions: Option[DetailsFields.USE][];
  animalOrBatch: AnimalOrBatchKeys;
  isMaleSelected?: boolean;
};

const GeneralDetails = ({
  t,
  formMethods,
  typeOptions,
  breedOptions,
  sexOptions,
  useOptions,
  animalOrBatch,
  isMaleSelected,
}: GeneralDetailsProps) => {
  const {
    control,
    register,
    trigger,
    formState: { errors },
  } = formMethods;

  const sexInputs = useMemo(() => {
    if (animalOrBatch === AnimalOrBatchKeys.ANIMAL) {
      return (
        <>
          <div>
            <InputBaseLabel optional label={t('ANIMAL.ANIMAL_SEXES')} />
            {/* @ts-ignore */}
            <RadioGroup
              name={DetailsFields.SEX}
              radios={sexOptions}
              hookFormControl={control}
              row
            />
          </div>
          {isMaleSelected && (
            <div>
              <InputBaseLabel optional label={t('ANIMAL.ADD_ANIMAL.USED_FOR_REPRODUCTION')} />
              {/* @ts-ignore */}
              <RadioGroup name={DetailsFields.USED_FOR_PRODUCTION} hookFormControl={control} row />
            </div>
          )}
        </>
      );
    }

    return 'TODO: LF-4159';
  }, [animalOrBatch, t, isMaleSelected, sexOptions, control]);

  return (
    <div className={styles.sectionWrapper}>
      {animalOrBatch === AnimalOrBatchKeys.BATCH && (
        <>
          {/* @ts-ignore */}
          <Input
            type="text"
            label={t('ANIMAL.ATTRIBUTE.BATCH_NAME')}
            hookFormRegister={register(DetailsFields.NAME, {
              maxLength: { value: 255, message: t('common:CHAR_LIMIT_ERROR', { value: 255 }) },
            })}
            trigger={trigger}
            optional
            placeholder={t('ANIMAL.ADD_ANIMAL.PLACEHOLDER.BATCH_NAME')}
            errors={getInputErrors(errors, DetailsFields.NAME)}
          />
        </>
      )}
      <Controller
        control={control}
        name={DetailsFields.TYPE}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('ANIMAL.ANIMAL_TYPE')}
            value={value}
            onChange={onChange}
            options={typeOptions}
          />
        )}
      />
      <Controller
        control={control}
        name={DetailsFields.BREED}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('ANIMAL.ANIMAL_BREED')}
            optional
            value={value}
            onChange={onChange}
            options={breedOptions}
          />
        )}
      />
      {sexInputs}
      <Controller
        control={control}
        name={DetailsFields.USE}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('common:USE')}
            optional
            isMulti
            value={value}
            onChange={onChange}
            options={useOptions}
          />
        )}
      />
    </div>
  );
};

export default GeneralDetails;
