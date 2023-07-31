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
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { Info, Main } from '../Typography';
import Form from '../Form';
import Button from '../Form/Button';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import { getTextAndOccurrences, RRULEDAYS } from './utils';
import { getDateWithDayOfWeek } from '../../util/date';
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
import styles from './styles.module.scss';

function PureRepeatCropPlanConfirmation({
  useHookFormPersist,
  persistedFormData,
  onGoBack,
  onSubmit,
  tasks,
  origStartDate,
}) {
  const { t } = useTranslation();
  const { historyCancel } = useHookFormPersist();

  const {
    planName,
    beginning,
    finishingText,
    numberOfPlans,
    numberOfTasks,
    willRepeatText,
    occurrences,
  } = useMemo(() => {
    const planName = persistedFormData[CROP_PLAN_NAME];
    const planStartDate = persistedFormData[PLAN_START_DATE];
    const repeatFrequencyNumber = persistedFormData[REPEAT_FREQUENCY];
    const finish = persistedFormData[FINISH];

    const daysOfWeek = persistedFormData[DAYS_OF_WEEK];
    const monthRepeatOn = persistedFormData[MONTH_REPEAT_ON] || {};
    const finishOnDate = persistedFormData[FINISH_ON_DATE];
    const afterOccurrences = persistedFormData[AFTER_OCCURRENCES];
    const repeatInterval = persistedFormData[REPEAT_INTERVAL];

    let finishingText = '';
    if (finish === 'on') {
      finishingText = t('REPEAT_PLAN.CONFIRMATION.ON_DATE', {
        date: getDateWithDayOfWeek(finishOnDate),
      });
    } else if (finish === 'after') {
      finishingText = (
        <Trans i18nKey={'REPEAT_PLAN.CONFIRMATION.AFTER_REPETITIONS'}>
          after <b>{{ number: afterOccurrences }}</b> occurrences
        </Trans>
      );
    }

    const { text: willRepeatText, occurrences } = getTextAndOccurrences(
      repeatInterval.value,
      origStartDate,
      planStartDate,
      repeatFrequencyNumber,
      finish,
      afterOccurrences,
      finishOnDate,
      daysOfWeek,
      monthRepeatOn.value,
    );

    const numberOfPlans = occurrences.length;
    const numberOfTasks = tasks.length * numberOfPlans;

    return {
      planName,
      beginning: getDateWithDayOfWeek(planStartDate),
      finishingText,
      numberOfPlans,
      numberOfTasks,
      willRepeatText,
      occurrences,
    };
  }, [persistedFormData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(occurrences);
  };

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} fullLength>
          {t('common:SAVE')}
        </Button>
      }
      onSubmit={handleSubmit}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('REPEAT_PLAN.REPEAT_PLAN_FLOW')}
        value={66}
        title={t('REPEAT_PLAN.TITLE')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ paddingBottom: '24px' }}>{t('REPEAT_PLAN.CONFIRMATION.HEADER')}</Main>
      <div className={styles.confirmationItem}>
        <Info className={styles.confirmationLabel}>{t('REPEAT_PLAN.CONFIRMATION.CROP_NAME')}</Info>
        <div className={styles.confirmationData}>{planName}</div>
      </div>
      <div className={styles.confirmationItem}>
        <Info className={styles.confirmationLabel}>{t('REPEAT_PLAN.CONFIRMATION.BEGINNING')}</Info>
        <div className={styles.confirmationData}>
          {t('REPEAT_PLAN.CONFIRMATION.ON_DATE', {
            date: beginning,
          })}
        </div>
      </div>
      <div className={styles.confirmationItem}>
        <Info className={styles.confirmationLabel}>
          {t('REPEAT_PLAN.CONFIRMATION.WILL_REPEAT')}
        </Info>
        <div className={styles.confirmationData}>{willRepeatText}</div>
      </div>
      <div className={styles.confirmationItem}>
        <Info className={styles.confirmationLabel}>{t('REPEAT_PLAN.CONFIRMATION.FINISHING')}</Info>
        <div className={styles.confirmationData}>{finishingText}</div>
      </div>
      <div className={styles.confirmationItem}>
        <Info className={styles.confirmationLabel}>
          {t('REPEAT_PLAN.CONFIRMATION.WILL_CREATE')}
        </Info>
        <div className={styles.confirmationData}>
          <Trans i18nKey={'REPEAT_PLAN.CONFIRMATION.WILL_CREATE_BODY'}>
            <span className={styles.confirmationHighlight}>{{ numberOfPlans }}</span> new crop plans
            and
            <span className={styles.confirmationHighlight}>{{ numberOfTasks }}</span> new tasks
          </Trans>
        </div>
      </div>
    </Form>
  );
}

PureRepeatCropPlanConfirmation.propTypes = {
  useHookFormPersist: PropTypes.func,
  onGoBack: PropTypes.func,
  onContinue: PropTypes.func,
  tasks: PropTypes.array.isRequired,
  origStartDate: PropTypes.string.isRequired,
  persistedFormData: PropTypes.shape({
    [CROP_PLAN_NAME]: PropTypes.string,
    [PLAN_START_DATE]: PropTypes.string,
    [REPEAT_FREQUENCY]: PropTypes.string,
    [REPEAT_INTERVAL]: PropTypes.shape({
      value: PropTypes.oneOf(['day', 'week', 'month', 'year']),
      label: PropTypes.string,
    }),
    [DAYS_OF_WEEK]: PropTypes.arrayOf(
      PropTypes.oneOf([
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]),
    ),
    [MONTH_REPEAT_ON]: PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
          weekday: PropTypes.oneOf(Object.values(RRULEDAYS)),
          ordinal: PropTypes.number,
        }),
      ]),
      label: PropTypes.string,
    }),
    [FINISH]: PropTypes.oneOf(['on', 'after']),
    [AFTER_OCCURRENCES]: PropTypes.string,
    [FINISH_ON_DATE]: PropTypes.string,
  }).isRequired,
};

export default PureRepeatCropPlanConfirmation;
