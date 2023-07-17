/*
 *  Copyright 2023 LiteFarm.org
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

import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import Form from '../Form';
import Button from '../Form/Button';
import Input, { integerOnKeyDown, getInputErrors } from '../Form/Input';
import RadioGroup from '../Form/RadioGroup';
import ReactSelect from '../Form/ReactSelect';
import DaysOfWeekSelect from '../Form/DaysOfWeekSelect';
import { Label, Main, Error } from '../Typography';
import { getWeekday, getDate, calculateMonthlyOptions, countOccurrences } from './utils';

export default function PureRepeatCropPlan({
  cropPlan,
  farmManagementPlansForCrop,
  origStartDate,
  onGoBack = () => {},
  onContinue = () => {},
  useHookFormPersist,
  fromCreation = false,
}) {
  const { t } = useTranslation(['translation', 'common']);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    setError,
    trigger,
    formState: { errors, isValid, dirtyFields },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      crop_plan_name: fromCreation ? cropPlan.name : '',
      plan_start_date: origStartDate,
      repeat_frequency: 1,
      repeat_interval: { value: 'week', label: t('REPEAT_PLAN.INTERVAL.WEEK') },
      days_of_week: [getWeekday(origStartDate)],
      finish: 'after',
      after_occurrences: 3,
    },
  });

  const { historyCancel } = useHookFormPersist(getValues);

  const intervalOptions = [
    { value: 'day', label: t('REPEAT_PLAN.INTERVAL.DAY') },
    { value: 'week', label: t('REPEAT_PLAN.INTERVAL.WEEK') },
    { value: 'month', label: t('REPEAT_PLAN.INTERVAL.MONTH') },
    { value: 'year', label: t('REPEAT_PLAN.INTERVAL.YEAR') },
  ];

  const [monthlyOptions, setMonthlyOptions] = useState([]);

  const totalCount = useRef();

  const planStartDate = watch('plan_start_date');
  const repeatFrequency = watch('repeat_frequency');
  const repeatInterval = watch('repeat_interval');
  const daysOfWeek = watch('days_of_week');
  const monthRepeatOn = watch('month_repeat_on');
  const finish = watch('finish');
  const finishOnDate = watch('finish_on_date');

  // Populate monthly options React Select
  useEffect(() => {
    if (repeatInterval.value !== 'month') {
      return;
    }
    // Clear when planStartDate is cleared
    if (!planStartDate) {
      setMonthlyOptions([]);
      setValue('month_repeat_on', null);
      return;
    }

    const getAndSetMonthlyOptions = async () => {
      // Store which pattern is currently selected
      const currentSelection = monthlyOptions?.findIndex(
        (option) =>
          // e.g. {"value":8,"label":"every month on the 8th"}
          JSON.stringify(option) === JSON.stringify(monthRepeatOn),
      );

      // Utility function uses rrule to generate natural language strings
      const options = await calculateMonthlyOptions(planStartDate, repeatFrequency);

      setMonthlyOptions(options);

      // Persist original selection
      if (options[currentSelection]) {
        setValue('month_repeat_on', options[currentSelection]);
      }
    };
    getAndSetMonthlyOptions();
  }, [planStartDate, repeatFrequency, repeatInterval]);

  // Count occurences to given "finish on" date
  useEffect(() => {
    if (!repeatFrequency || !repeatInterval || !planStartDate || !finishOnDate || finish !== 'on') {
      return;
    }

    const count = countOccurrences({
      planStartDate,
      repeatFrequency,
      repeatInterval,
      daysOfWeek: daysOfWeek ?? [getWeekday(planStartDate)],
      monthRepeatOn: monthRepeatOn ?? { value: getDate(planStartDate) },
      finishOnDate,
      finish,
    });

    totalCount.current = count;

    trigger('finish_on_date');
  }, [planStartDate, repeatFrequency, repeatInterval, finishOnDate, monthRepeatOn]);

  // Custom validation for "finish on" date input
  const validateFinishOnDate = (value) => {
    if (getValues('finish') === 'after') {
      return true;
    }
    // Validate only after interaction with input
    if (dirtyFields.finish_on_date && !value) {
      return t('common:REQUIRED');

      // End date must be > start date
    } else if (value && value <= getValues('plan_start_date')) {
      return t('REPEAT_PLAN.LATER_DATE_ERROR');

      // Total count must be 20 or less
    } else if (value && totalCount.current > 20) {
      return t('REPEAT_PLAN.REPEAT_LIMIT_ERROR');
    }

    return true;
  };

  const uniquePlanName = () => {
    if (fromCreation) {
      return true; // uniqueness must be enforced at creation as the input is not shown here
    }
    const formPlanName = getValues('crop_plan_name');
    const planNameExists = farmManagementPlansForCrop.some((plan) => {
      return plan.name === formPlanName;
    });
    return !planNameExists;
  };

  const showDuplicatePlanError = () => {
    setError(
      'crop_plan_name',
      {
        type: 'custom',
        message: t('REPEAT_PLAN.DUPLICATE_NAME'),
      },
      { shouldFocus: true },
    );
  };

  const checkUniqueNameAndSubmit = (data) => {
    uniquePlanName() ? onContinue(data) : showDuplicatePlanError();
  };

  return (
    <Form
      buttonGroup={
        <Button
          disabled={!isValid}
          onClick={handleSubmit(checkUniqueNameAndSubmit)}
          type={'submit'}
          fullLength
        >
          {t('common:CONTINUE')}
        </Button>
      }
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('REPEAT_PLAN.REPEAT_PLAN_FLOW')}
        title={t('REPEAT_PLAN.TITLE')}
        value={33}
        style={{ marginBottom: '24px' }}
      />
      <Main>{[t('REPEAT_PLAN.SUBTITLE')]}</Main>

      <div className={styles.container}>
        {!fromCreation && (
          <Input
            label={t('REPEAT_PLAN.PLAN_NAME')}
            hookFormRegister={register('crop_plan_name', {
              required: true,
            })}
            errors={getInputErrors(errors, 'crop_plan_name')}
            placeholder={t('REPEAT_PLAN.REPETITIONS_OF', {
              planName: cropPlan.name,
            })}
          />
        )}

        <Input
          type="date"
          label={t('REPEAT_PLAN.START_DATE')}
          hookFormRegister={register('plan_start_date', { required: true })}
          errors={getInputErrors(errors, 'plan_start_date')}
        />

        <div>
          <Label className={styles.label}>{t('REPEAT_PLAN.REPEAT_EVERY')}</Label>
          <div className={styles.repeatEvery}>
            <Input
              hookFormRegister={register('repeat_frequency', {
                required: true,
              })}
              type="number"
              stepper
              onKeyDown={integerOnKeyDown}
              min={1}
              max={50}
              style={{ width: '96px' }}
            />
            <Controller
              control={control}
              name={'repeat_interval'}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <ReactSelect
                  options={intervalOptions}
                  onChange={(e) => {
                    onChange(e);
                  }}
                  value={value}
                  style={{ width: '100%' }}
                />
              )}
            />
          </div>
        </div>

        {repeatInterval?.value === 'week' && (
          <div className={styles.weekdayLabelAndSelect}>
            <Label className={styles.label}>{t('REPEAT_PLAN.REPEAT_ON')}</Label>
            <Controller
              control={control}
              name={'days_of_week'}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <DaysOfWeekSelect
                  onChange={onChange}
                  defaultValue={value}
                  maxSelect={1}
                  errors={getInputErrors(errors, 'days_of_week')}
                />
              )}
            />
          </div>
        )}

        {repeatInterval?.value === 'month' && (
          <div className={styles.monthlyOptionsSelect}>
            <Controller
              control={control}
              name={'month_repeat_on'}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <ReactSelect
                  options={monthlyOptions}
                  onChange={(e) => {
                    onChange(e);
                  }}
                  value={value}
                  placeholder={monthlyOptions?.[0]?.label}
                />
              )}
            />
          </div>
        )}

        <div>
          <Label className={styles.label}>{t('REPEAT_PLAN.FINISH')}</Label>

          <RadioGroup
            hookFormControl={control}
            name="finish"
            required
            onChange={() => {
              trigger('finish_on_date');
            }}
            radios={[
              {
                label: '',
                value: 'after',
                children: (
                  <div className={styles.radioGroup}>
                    <p>{t('REPEAT_PLAN.AFTER')}</p>
                    <Input
                      type="number"
                      stepper
                      onKeyDown={integerOnKeyDown}
                      min={1}
                      max={20}
                      hookFormRegister={register('after_occurrences', {
                        validate: (value) => {
                          if (!value && getValues('finish') === 'after') {
                            return t('common:REQUIRED');
                          }
                          return true;
                        },
                      })}
                      style={{ width: '72px' }}
                      onChange={() => {
                        setValue('finish', 'after');
                        trigger('finish_on_date');
                      }}
                    />
                    <p>{t('REPEAT_PLAN.REPETITIONS')}</p>
                  </div>
                ),
              },
              {
                label: '',
                value: 'on',
                children: (
                  <div className={styles.radioGroup}>
                    <p>{t('REPEAT_PLAN.ON')}</p>
                    <Input
                      type="date"
                      hookFormRegister={register('finish_on_date', {
                        validate: validateFinishOnDate,
                      })}
                      onChange={() => setValue('finish', 'on')}
                    />
                  </div>
                ),
              },
            ]}
          />
          <Error className={styles.finishOnDateErrors}>
            {getInputErrors(errors, 'finish_on_date') ?? ''}
          </Error>
        </div>
      </div>
    </Form>
  );
}

PureRepeatCropPlan.prototype = {
  cropPlan: PropTypes.object,
  origStartDate: PropTypes.string,
  farmManagementPlansForCrop: PropTypes.array,
  fromCreation: PropTypes.bool,
  useHookFormPersist: PropTypes.func,
  onGoBack: PropTypes.func,
  onContinue: PropTypes.func,
};
