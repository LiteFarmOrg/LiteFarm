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
import { Controller, useFormContext } from 'react-hook-form';
import Input, { getInputErrors } from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import ReactSelect from '../../Form/ReactSelect';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import NumberInput from '../../Form/NumberInput';
import SexDetails from '../../Form/SexDetails';
import { type Details as SexDetailsType } from '../../Form/SexDetails/SexDetailsPopover';
import { AnimalOrBatchKeys } from '../../../containers/Animals/types';
import { DetailsFields, type Option, type CommonDetailsProps } from './type';
import styles from './styles.module.scss';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';

export type GeneralDetailsProps = CommonDetailsProps & {
  sexOptions: Option[DetailsFields.SEX][];
  useOptions: Option[DetailsFields.USE][];
  animalOrBatch: AnimalOrBatchKeys;
  isOtherUseSelected?: boolean;
  sexDetailsOptions?: SexDetailsType;
};

const GeneralDetails = ({
  t,
  sexOptions,
  useOptions,
  animalOrBatch,
  isOtherUseSelected,
  sexDetailsOptions,
}: GeneralDetailsProps) => {
  const {
    control,
    register,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext();

  const watchBatchCount = watch(DetailsFields.COUNT) || 0;

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
        </>
      );
    }

    return (
      <div className={styles.countAndSexDetailsWrapper}>
        <NumberInput
          name={DetailsFields.COUNT}
          control={control}
          defaultValue={0}
          label={t('common:COUNT')}
          className={styles.countInput}
          allowDecimal={false}
          showStepper
        />
        <Controller
          name={DetailsFields.SEX_DETAILS}
          control={control}
          render={({ field }) => (
            <SexDetails
              initialDetails={sexDetailsOptions!}
              maxCount={watchBatchCount}
              onConfirm={(details) => field.onChange(details)}
            />
          )}
        />
      </div>
    );
  }, [animalOrBatch, t, sexOptions, control, watchBatchCount]);

  return (
    <div className={styles.sectionWrapper}>
      {animalOrBatch === AnimalOrBatchKeys.BATCH && (
        <>
          {/* @ts-ignore */}
          <Input
            type="text"
            label={t('ANIMAL.ATTRIBUTE.BATCH_NAME')}
            hookFormRegister={register(DetailsFields.NAME, {
              maxLength: hookFormMaxCharsValidation(255),
            })}
            trigger={trigger}
            optional
            placeholder={t('ADD_ANIMAL.PLACEHOLDER.BATCH_NAME')}
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
            isDisabled
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
            isDisabled
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
            style={{ paddingBottom: '12px' }} // accomodate "Clear all" button space
          />
        )}
      />
      {isOtherUseSelected && (
        <>
          {/* @ts-ignore */}
          <Input
            type="text"
            label={t('ANIMAL.ATTRIBUTE.OTHER_USE')}
            hookFormRegister={register(DetailsFields.OTHER_USE, {
              maxLength: hookFormMaxCharsValidation(255),
            })}
            optional
            placeholder={t('ADD_ANIMAL.PLACEHOLDER.OTHER_USE')}
            errors={getInputErrors(errors, DetailsFields.OTHER_USE)}
          />
        </>
      )}
    </div>
  );
};

export default GeneralDetails;
