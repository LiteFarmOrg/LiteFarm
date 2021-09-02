import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Layout from '../../Layout';
import PageTitle from '../../PageTitle/v2';
import { Info, Underlined } from '../../Typography';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import ReactSelect from '../../Form/ReactSelect';
import { Controller, useForm } from 'react-hook-form';
import InputAutoSize from '../../Form/InputAutoSize';
import Input from '../../Form/Input';
import { Main } from '../../Typography';
import TimeSlider from '../../Form/Slider/TimeSlider';
import Checkbox from '../../Form/Checkbox';
import Rating from '../../Rating';
// import { cloneObject } from '../../util';

const PureAbandonTask = ({ onSubmit, onError, onGoBack }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, control, setValue } = useForm({});

  const REASON_FOR_ABANDONMENT = 'reason_for_abandonment';
  const OTHER_REASON_FOR_ABANDONMENT = 'other_abandonment_reason';
  const TASK_ABANDONMENT_NOTES = 'abandonment_notes';
  const DURATION = 'duration';
  const HAPPINESS = 'happiness';
  const NO_WORK_COMPLETED = 'no_work_completed';
  const PREFER_NOT_TO_SAY = 'prefer_not_to_say';

  const reason_for_abandonment = watch(REASON_FOR_ABANDONMENT);
  const prefer_not_to_say = watch(PREFER_NOT_TO_SAY);
  const no_work_completed = watch(NO_WORK_COMPLETED);
  const happiness = watch(HAPPINESS);

  // TODO: replace with isValid when ReactSelect bug is fixed
  const disabled =
    !reason_for_abandonment ||
    (reason_for_abandonment?.value === 'OTHER' && !watch(OTHER_REASON_FOR_ABANDONMENT)) ||
    (!prefer_not_to_say && happiness === 0);

  // TODO: bring the options up to the smart component (eventually will be an api call + selector)
  const abandonmentReasonOptions = [
    { label: t('TASK.ABANDON.REASON.CROP_FAILURE'), value: 'CROP_FAILURE' },
    { label: t('TASK.ABANDON.REASON.LABOUR_ISSUE'), value: 'LABOUR_ISSUE' },
    { label: t('TASK.ABANDON.REASON.MARKET_PROBLEM'), value: 'MARKET_PROBLEM' },
    { label: t('TASK.ABANDON.REASON.WEATHER'), value: 'WEATHER' },
    { label: t('TASK.ABANDON.REASON.MACHINERY_ISSUE'), value: 'MACHINERY_ISSUE' },
    { label: t('TASK.ABANDON.REASON.SCHEDULING_ISSUE'), value: 'SCHEDULING_ISSUE' },
    { label: t('TASK.ABANDON.REASON.OTHER'), value: 'OTHER' },
  ];

  return (
    <Layout
      buttonGroup={
        <Button disabled={disabled} onClick={handleSubmit(onSubmit, onError)} fullLength>
          {t('TASK.ABANDON.ABANDON')}
        </Button>
      }
    >
      <PageTitle title={t('TASK.ABANDON.TITLE')} onGoBack={onGoBack} />

      <Info style={{ marginTop: '20px', marginBottom: '24px' }}>{t('TASK.ABANDON.INFO')}</Info>

      <Controller
        control={control}
        name={REASON_FOR_ABANDONMENT}
        render={({ field }) => (
          <ReactSelect
            options={abandonmentReasonOptions}
            label={t('TASK.ABANDON.REASON_FOR_ABANDONMENT')}
            required={true}
            style={{ marginBottom: '24px' }}
            {...field}
          />
        )}
        rules={{ required: true }}
      />

      {reason_for_abandonment?.value === 'OTHER' && (
        <Input
          label={t('TASK.ABANDON.WHAT_HAPPENED')}
          hookFormRegister={register(OTHER_REASON_FOR_ABANDONMENT)}
          style={{ marginBottom: '24px' }}
        />
      )}

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE_TASK_DURATION')}</Main>

      {!no_work_completed && (
        <TimeSlider
          style={{ marginBottom: '20px' }}
          label={t('TASK.DURATION')}
          setValue={(durationInMinutes) => setValue(DURATION, durationInMinutes)}
        />
      )}

      <Checkbox
        style={{ marginBottom: '42px' }}
        label={t('TASK.NO_WORK_DONE')}
        hookFormRegister={register(NO_WORK_COMPLETED)}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.DID_YOU_ENJOY')}</Main>

      <Rating
        style={{ display: 'flex', marginBottom: '27px' }}
        label={t('TASK.PROVIDE_RATING')}
        disabled={prefer_not_to_say}
        onRate={(value) => setValue(HAPPINESS, value)}
      />

      <Checkbox
        style={{ marginBottom: '42px' }}
        label={t('TASK.PREFER_NOT_TO_SAY')}
        hookFormRegister={register(PREFER_NOT_TO_SAY)}
      />

      <InputAutoSize
        optional={true}
        label={t('TASK.ABANDON.NOTES')}
        hookFormRegister={register(TASK_ABANDONMENT_NOTES)}
      />
    </Layout>
  );
};

PureAbandonTask.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
  onGoBack: PropTypes.func,
};

export default PureAbandonTask;
