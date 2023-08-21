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

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import {
  getWeekday,
  getDate,
  getLocalizedDateString,
  calculateMonthlyOptions,
  countOccurrences,
} from './utils';
import {
  CROP_PLAN_NAME,
  PLAN_START_DATE,
  REPEAT_FREQUENCY,
  REPEAT_INTERVAL,
  DAYS_OF_WEEK,
  MONTH_REPEAT_ON,
  FINISH,
  AFTER_OCCURRENCES,
  FINISH_ON_DATE,
} from './constants';

export default function PureRepeatCropPlan({
  cropPlan,
  farmManagementPlansForCrop,
  origStartDate,
  origStartDateType,
  onGoBack = () => {},
  onContinue = () => {},
  useHookFormPersist,
  persistedFormData,
}) {
  const { t } = useTranslation(['translation', 'common']);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      [CROP_PLAN_NAME]: t('REPEAT_PLAN.REPETITIONS_OF', {
        planName: cropPlan.name,
        interpolation: { escapeValue: false },
      }),
      [PLAN_START_DATE]: origStartDate,
      [REPEAT_FREQUENCY]: '1',
      [REPEAT_INTERVAL]: { value: 'week', label: t('REPEAT_PLAN.INTERVAL.WEEK') },
      [DAYS_OF_WEEK]: [getWeekday(origStartDate)],
      [FINISH]: 'after',
      [AFTER_OCCURRENCES]: '3',
      ...persistedFormData,
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

  const planStartDate = watch(PLAN_START_DATE);
  const repeatFrequency = watch(REPEAT_FREQUENCY);
  const repeatInterval = watch(REPEAT_INTERVAL);
  const daysOfWeek = watch(DAYS_OF_WEEK);
  const monthRepeatOn = watch(MONTH_REPEAT_ON);
  const finish = watch(FINISH);
  const finishOnDate = watch(FINISH_ON_DATE);

  // Trigger validation of the crop plan name on initial load
  useEffect(() => {
    trigger(CROP_PLAN_NAME);
  }, []);

  // Update DaysOfWeekSelect selection
  const onPlantDateOrRepeatIntervalChange = useCallback((repeatInterval, planStartDate) => {
    if (repeatInterval.value !== 'week') {
      return;
    }
    const dayOfWeekString = getWeekday(planStartDate);
    setValue(DAYS_OF_WEEK, [dayOfWeekString]);
  }, []);
  const onPlantDateChange = useCallback((e) => {
    onPlantDateOrRepeatIntervalChange(getValues(REPEAT_INTERVAL), e.target.value);
  }, []);
  const onRepeatIntervalChange = useCallback((e) => {
    onPlantDateOrRepeatIntervalChange(e, getValues(PLAN_START_DATE));
  }, []);

  // Populate monthly options React Select
  useEffect(() => {
    if (repeatInterval.value !== 'month') {
      return;
    }
    // Clear when planStartDate is cleared
    if (!planStartDate) {
      setMonthlyOptions([]);
      setValue(MONTH_REPEAT_ON, null);
      return;
    }

    // Utility function uses rrule to generate natural language strings
    const options = calculateMonthlyOptions(planStartDate, repeatFrequency);

    // If already on this screen, store which pattern is currently selected.
    // When returning from next screen, store the selected option
    const currentSelection = (monthlyOptions.length ? monthlyOptions : options)?.findIndex(
      (option) =>
        // e.g. {"value":8,"label":"every month on the 8th"}
        JSON.stringify(option) === JSON.stringify(monthRepeatOn),
    );

    setMonthlyOptions(options);

    // Persist original selection if there is one
    if (options[currentSelection]) {
      setValue(MONTH_REPEAT_ON, options[currentSelection]);
    } else {
      // or select first option by default
      setValue(MONTH_REPEAT_ON, options[0]);
    }
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
      origStartDate,
    });

    totalCount.current = count;

    trigger(FINISH_ON_DATE);
  }, [
    planStartDate,
    repeatFrequency,
    repeatInterval,
    finishOnDate,
    monthRepeatOn,
    daysOfWeek,
    finish,
  ]);

  // Custom validation for crop plan name uniqueness
  const validateUniquePlanName = (value) => {
    const planNameExists = farmManagementPlansForCrop.some((plan) => {
      return plan.name === value;
    });

    if (planNameExists) {
      return t('REPEAT_PLAN.DUPLICATE_NAME');
    }
    return true;
  };

  // Custom validation for "finish on" date input
  const validateFinishOnDate = (value) => {
    if (getValues(FINISH) === 'after') {
      return true;
    }

    if (!value) {
      return t('common:REQUIRED');

      // End date must be > start date
    } else if (value && value <= getValues(PLAN_START_DATE)) {
      return t('REPEAT_PLAN.LATER_DATE_ERROR');

      // Total count must be 20 or less
    } else if (value && totalCount.current > 20) {
      return t('REPEAT_PLAN.REPEAT_LIMIT_ERROR');
    }

    return true;
  };

  const origStartDateTypes = { completion: t('REPEAT_PLAN.COMPLETION'), due: t('REPEAT_PLAN.DUE') };

  return (
    <Form
      buttonGroup={
        <Button disabled={!isValid} onClick={handleSubmit(onContinue)} type={'submit'} fullLength>
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
      <Main>{t('REPEAT_PLAN.SUBTITLE')}</Main>

      <div className={styles.container}>
        <Input
          label={t('REPEAT_PLAN.PLAN_NAME')}
          hookFormRegister={register(CROP_PLAN_NAME, {
            required: true,
            validate: validateUniquePlanName,
          })}
          errors={getInputErrors(errors, CROP_PLAN_NAME)}
        />

        <div>
          <Input
            type="date"
            label={t('REPEAT_PLAN.START_DATE')}
            hookFormRegister={register(PLAN_START_DATE, { required: true })}
            errors={getInputErrors(errors, PLAN_START_DATE)}
            onChange={onPlantDateChange}
          />

          <Main className={styles.taskSubtext}>
            {t('REPEAT_PLAN.EARLIEST_TASK', {
              date: getLocalizedDateString(origStartDate),
              dateType: origStartDateTypes[origStartDateType],
            })}
          </Main>
        </div>

        <div>
          <Label className={styles.label}>{t('REPEAT_PLAN.REPEAT_EVERY')}</Label>
          <div className={styles.repeatEvery}>
            <Input
              hookFormRegister={register(REPEAT_FREQUENCY, {
                required: true,
                validate: (value) => {
                  // These errors aren't displayed so no translation is necessary
                  if (value < 1 || value > 50) {
                    return 'must be between 1 and 50';
                  }
                  if (Math.floor(value) != value) {
                    return 'must be an integer';
                  }
                  return true;
                },
              })}
              type="number"
              stepper
              onChange={(e) => (e.target.value = Math.floor(e.target.value))}
              onKeyDown={integerOnKeyDown}
              min={1}
              max={50}
              style={{ width: '96px' }}
            />
            <Controller
              control={control}
              name={REPEAT_INTERVAL}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <ReactSelect
                  options={intervalOptions}
                  onChange={(e) => {
                    onChange(e);
                    onRepeatIntervalChange(e);
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
              name={DAYS_OF_WEEK}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <DaysOfWeekSelect
                  onChange={onChange}
                  defaultValue={value}
                  maxSelect={1}
                  errors={getInputErrors(errors, DAYS_OF_WEEK)}
                />
              )}
            />
          </div>
        )}

        {repeatInterval?.value === 'month' && (
          <div className={styles.monthlyOptionsSelect}>
            <Controller
              control={control}
              name={MONTH_REPEAT_ON}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <ReactSelect
                  options={monthlyOptions}
                  onChange={(e) => {
                    onChange(e);
                  }}
                  value={value}
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
              trigger(FINISH_ON_DATE);
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
                      hookFormRegister={register(AFTER_OCCURRENCES, {
                        validate: (value) => {
                          if (!value && getValues(FINISH) === 'after') {
                            return t('common:REQUIRED');
                          }
                          // These errors aren't displayed so no translation is necessary
                          if (value < 1 || value > 20) {
                            return 'must be between 1 and 20';
                          }
                          if (Math.floor(value) != value) {
                            return 'must be an integer';
                          }
                          return true;
                        },
                      })}
                      style={{ width: '72px' }}
                      onChange={(e) => {
                        e.target.value = Math.floor(e.target.value);
                        setValue(FINISH, 'after');
                        trigger(FINISH_ON_DATE);
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
                      hookFormRegister={register(FINISH_ON_DATE, {
                        validate: validateFinishOnDate,
                      })}
                      onChange={() => setValue(FINISH, 'on')}
                    />
                  </div>
                ),
              },
            ]}
          />
          <Error className={styles.finishOnDateErrors}>
            {getInputErrors(errors, FINISH_ON_DATE) ?? ''}
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
  useHookFormPersist: PropTypes.func,
  onGoBack: PropTypes.func,
  onContinue: PropTypes.func,
};
