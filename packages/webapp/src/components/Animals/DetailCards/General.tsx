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

import { useEffect } from 'react';
import { Controller, get, useFormContext } from 'react-hook-form';
import clsx from 'clsx';
import Input, { getInputErrors } from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import ReactSelect from '../../Form/ReactSelect';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import NumberInput from '../../Form/NumberInput';
import SexDetails from '../../Form/SexDetails';
import { type Details as SexDetailsType } from '../../Form/SexDetails/SexDetailsPopover';
import { AnimalOrBatchKeys } from '../../../containers/Animals/types';
import {
  DetailsFields,
  type Option,
  type CommonDetailsProps,
} from '../../../containers/Animals/AddAnimals/types';
import styles from './styles.module.scss';
import {
  hookFormMinValidation,
  hookFormMaxCharsValidation,
  hookFormMaxValidation,
} from '../../Form/hookformValidationUtils';
import LockedInput from '../../Form/LockedInput';
import {
  AnimalTypeSelect,
  Option as AnimalSelectOption,
  AnimalBreedSelect,
} from '../AddAnimalsFormCard/AnimalSelect';
import { parseUniqueDefaultId } from '../../../util/animal';
import { BATCH_COUNT_LIMIT } from '../../../containers/Animals/AddAnimals/utils';

export type AnimalUseOptions = {
  default_type_id: number | null;
  uses: Option[DetailsFields.USE][];
}[];

export type GeneralDetailsProps = CommonDetailsProps & {
  sexOptions: Option[DetailsFields.SEX][];
  animalUseOptions: AnimalUseOptions;
  animalOrBatch: AnimalOrBatchKeys;
  sexDetailsOptions?: SexDetailsType;
  typeOptions?: AnimalSelectOption[];
  breedOptions?: AnimalSelectOption[];
  onTypeChange?: (Option: AnimalSelectOption | null) => void;
};

const GeneralDetails = ({
  t,
  sexOptions,
  animalUseOptions,
  animalOrBatch,
  sexDetailsOptions,
  namePrefix = '',
  mode = 'add',
  typeOptions = [],
  onTypeChange,
  breedOptions = [],
}: GeneralDetailsProps) => {
  const {
    control,
    register,
    trigger,
    watch,
    getValues,
    resetField,
    formState: { errors },
  } = useFormContext();

  const watchBatchCount = watch(`${namePrefix}${DetailsFields.COUNT}`) || 0;
  const watchedUse = watch(`${namePrefix}${DetailsFields.USE}`) as Option[DetailsFields.USE][];

  const watchAnimalType = watch(`${namePrefix}${DetailsFields.TYPE}`);
  const filteredBreeds = breedOptions.filter(({ type }) => type === watchAnimalType?.value);

  const filteredUses = watchAnimalType?.value
    ? animalUseOptions.find(
        ({ default_type_id }) => default_type_id === parseUniqueDefaultId(watchAnimalType?.value),
      )?.uses
    : animalUseOptions.find(({ default_type_id }) => default_type_id === null)?.uses;

  const isOtherUseSelected = !watchedUse ? false : watchedUse.some((use) => use.key === 'OTHER');

  useEffect(() => {
    // Prevent the error from persisting when returning from animal basics
    trigger(`${namePrefix}${DetailsFields.COUNT}`);
  }, []);

  const sexInputs =
    animalOrBatch === AnimalOrBatchKeys.ANIMAL ? (
      <div>
        <InputBaseLabel optional label={t('ANIMAL.ANIMAL_SEXES')} />
        {/* @ts-ignore */}
        <RadioGroup
          name={`${namePrefix}${DetailsFields.SEX}`}
          radios={sexOptions}
          hookFormControl={control}
          row
          disabled={mode === 'readonly'}
        />
      </div>
    ) : (
      <div className={styles.countAndSexDetailsWrapper}>
        <NumberInput
          name={`${namePrefix}${DetailsFields.COUNT}`}
          control={control}
          label={t('common:COUNT')}
          className={styles.countInput}
          allowDecimal={false}
          showStepper
          defaultValue={getValues(`${namePrefix}${DetailsFields.COUNT}`)}
          rules={{
            required: {
              value: true,
              message: t('common:REQUIRED'),
            },
            min: hookFormMinValidation(1),
            max: hookFormMaxValidation(BATCH_COUNT_LIMIT),
          }}
          onChange={() => trigger(`${namePrefix}${DetailsFields.COUNT}`)}
          disabled={mode === 'readonly'}
        />
        <Controller
          name={`${namePrefix}${DetailsFields.SEX_DETAILS}`}
          control={control}
          rules={{
            validate: (details: SexDetailsType) => {
              if (!details) return true;
              const total = details.reduce((prevCount, { count }) => prevCount + count, 0);
              return total <= watchBatchCount || 'Invalid sexDetails for count';
            },
          }}
          render={({ field: { onChange, value } }) => (
            <SexDetails
              initialDetails={value || sexDetailsOptions}
              maxCount={watchBatchCount}
              onConfirm={onChange}
              isDisabled={mode === 'readonly'}
            />
          )}
        />
      </div>
    );

  return (
    <div className={clsx(styles.sectionWrapper, mode === 'edit' && styles.edit)}>
      {(mode === 'readonly' || mode === 'edit') && (
        <>
          {/* @ts-ignore */}
          <LockedInput
            label={t('ANIMAL.ATTRIBUTE.LITEFARM_ID')}
            placeholder={`${t('ANIMAL.ANIMAL_ID')}${getValues(`${namePrefix}${DetailsFields.ID}`)}`}
          />
        </>
      )}
      {animalOrBatch === AnimalOrBatchKeys.BATCH && (
        <>
          {/* @ts-ignore */}
          <Input
            type="text"
            label={t('ANIMAL.ATTRIBUTE.BATCH_NAME')}
            hookFormRegister={register(`${namePrefix}${DetailsFields.BATCH_NAME}`, {
              maxLength: hookFormMaxCharsValidation(255),
            })}
            trigger={trigger}
            optional
            placeholder={t('ADD_ANIMAL.PLACEHOLDER.BATCH_NAME')}
            errors={getInputErrors(errors, `${namePrefix}${DetailsFields.BATCH_NAME}`)}
            disabled={mode === 'readonly'}
          />
        </>
      )}
      <AnimalTypeSelect
        name={`${namePrefix}${DetailsFields.TYPE}`}
        control={control}
        typeOptions={typeOptions}
        onTypeChange={(option) => {
          trigger(`${namePrefix}${DetailsFields.TYPE}`);
          onTypeChange?.(option);
          resetField(`${namePrefix}${DetailsFields.BREED}`, { defaultValue: null });
        }}
        error={get(errors, `${namePrefix}${DetailsFields.TYPE}`)}
        isDisabled={mode !== 'edit'}
      />
      <AnimalBreedSelect
        name={`${namePrefix}${DetailsFields.BREED}`}
        control={control}
        breedOptions={filteredBreeds}
        isTypeSelected={!!watchAnimalType}
        isDisabled={mode !== 'edit'}
      />
      {sexInputs}
      <Controller
        control={control}
        name={`${namePrefix}${DetailsFields.USE}`}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('common:USE')}
            optional
            isMulti
            value={value}
            onChange={onChange}
            options={filteredUses}
            style={{ paddingBottom: '12px' }} // accomodate "Clear all" button space
            isDisabled={mode === 'readonly'}
          />
        )}
      />
      {isOtherUseSelected && (
        <>
          {/* @ts-ignore */}
          <Input
            type="text"
            label={t('ANIMAL.ATTRIBUTE.OTHER_USE')}
            hookFormRegister={register(`${namePrefix}${DetailsFields.OTHER_USE}`, {
              maxLength: hookFormMaxCharsValidation(255),
            })}
            optional
            placeholder={t('ADD_ANIMAL.PLACEHOLDER.OTHER_USE')}
            errors={getInputErrors(errors, `${namePrefix}${DetailsFields.OTHER_USE}`)}
            disabled={mode === 'readonly'}
          />
        </>
      )}
    </div>
  );
};

export default GeneralDetails;
