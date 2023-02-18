import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Layout from '../../Layout';
import PageTitle from '../../PageTitle/v2';
import { Info, Main } from '../../Typography';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import ReactSelect from '../../Form/ReactSelect';
import { Controller, useForm } from 'react-hook-form';
import InputAutoSize from '../../Form/InputAutoSize';
import Input from '../../Form/Input';
import TimeSlider from '../../Form/Slider/TimeSlider';
import Checkbox from '../../Form/Checkbox';
import Rating from '../../Rating';
import { getDateInputFormat } from '../../../util/moment';
import { isNotInFuture } from '../../Form/Input/utils';
import RadioGroup from '../../Form/RadioGroup';
import styles from './styles.module.scss';
import clsx from 'clsx';
import {
  ABANDON_DATE_SELECTED,
  ORIGINAL_DUE_DATE,
  TODAY_DUE_DATE,
  ANOTHER_DUE_DATE,
} from './constants';

const PureAbandonTask = ({
  onSubmit,
  onError,
  onGoBack,
  hasAssignee,
  isAssigneeTheLoggedInUser,
  originalDueDate,
}) => {
  const REASON_FOR_ABANDONMENT = 'reason_for_abandonment';
  const OTHER_REASON_FOR_ABANDONMENT = 'other_abandonment_reason';
  const ABANDON_DATE = 'abandon_date';
  const TASK_ABANDONMENT_NOTES = 'abandonment_notes';
  const DURATION = 'duration';
  const HAPPINESS = 'happiness';
  const NO_WORK_COMPLETED = 'no_work_completed';
  const PREFER_NOT_TO_SAY = 'prefer_not_to_say';
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      [ABANDON_DATE]: '',
      [PREFER_NOT_TO_SAY]: !isAssigneeTheLoggedInUser,
      [ABANDON_DATE_SELECTED]: ORIGINAL_DUE_DATE,
    },
  });
  const [selectedAbandonOption, setSelectedAbandonOption] = useState(ORIGINAL_DUE_DATE);

  const reason_for_abandonment = watch(REASON_FOR_ABANDONMENT);
  const prefer_not_to_say = watch(PREFER_NOT_TO_SAY);
  const no_work_completed = watch(NO_WORK_COMPLETED);
  const happiness = watch(HAPPINESS);

  const disabled = !isValid || (hasAssignee && !happiness && !prefer_not_to_say);
  const showDatePicker = selectedAbandonOption === ANOTHER_DUE_DATE;

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
        <Button
          data-cy="abandon-save"
          disabled={disabled}
          onClick={handleSubmit(onSubmit, onError)}
          fullLength
        >
          {t('TASK.ABANDON.ABANDON')}
        </Button>
      }
    >
      <PageTitle title={t('TASK.ABANDON.TITLE')} onGoBack={onGoBack} />

      <Info style={{ marginTop: '20px', marginBottom: '24px' }}>{t('TASK.ABANDON.INFO')}</Info>

      <Main style={{ marginBottom: '24px' }}>{t('TASK.ABANDON.WHEN')}</Main>

      <RadioGroup
        hookFormControl={control}
        onChange={(e) => setSelectedAbandonOption(e.target.value)}
        name={ABANDON_DATE_SELECTED}
        disabled={false}
        style={{ paddingBottom: '16px' }}
        radios={[
          {
            value: ORIGINAL_DUE_DATE,
            label: (
              <div
                className={clsx(styles.radioLabel, {
                  [styles.active]: selectedAbandonOption === ORIGINAL_DUE_DATE,
                })}
              >
                {t('TASK.ABANDON.DATE_ORIGINAL')}
                <span>{getDateInputFormat(originalDueDate)}</span>
              </div>
            ),
          },
          {
            value: TODAY_DUE_DATE,
            label: (
              <div
                className={clsx(styles.radioLabel, {
                  [styles.active]: selectedAbandonOption === TODAY_DUE_DATE,
                })}
              >
                {t('TASK.ABANDON.DATE_TODAY')}
                <span>{getDateInputFormat()}</span>
              </div>
            ),
          },
          {
            value: ANOTHER_DUE_DATE,
            label: t('TASK.ABANDON.DATE_ANOTHER'),
          },
        ]}
      />

      {showDatePicker && (
        <Input
          label={t('TASK.ABANDON.WHICH_DATE')}
          hookFormRegister={register(ABANDON_DATE, {
            required: true,
          })}
          style={{ marginBottom: '24px' }}
          type={'date'}
          required
          autoFocus
          openCalendar
        />
      )}

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
            placeholder={t(`common:SELECT`)}
          />
        )}
        rules={{ required: true }}
      />

      {reason_for_abandonment?.value === 'OTHER' && (
        <Input
          label={t('TASK.ABANDON.WHAT_HAPPENED')}
          hookFormRegister={register(OTHER_REASON_FOR_ABANDONMENT, { required: true })}
          style={{ marginBottom: '24px' }}
          required
          onFocus={(e) => console.log('selected')}
        />
      )}

      {hasAssignee && (
        <>
          <Main style={{ marginBottom: '24px' }} tooltipContent={t('TASK.ABANDON_TASK_HELPTEXT')}>
            {t('TASK.ABANDON_TASK_DURATION')}
          </Main>

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

          {isAssigneeTheLoggedInUser && (
            <>
              <Main style={{ marginBottom: '24px' }}>{t('TASK.DID_YOU_ENJOY')}</Main>
              {!prefer_not_to_say && (
                <Rating
                  style={{ display: 'flex', marginBottom: '27px' }}
                  label={t('TASK.PROVIDE_RATING')}
                  disabled={prefer_not_to_say}
                  onRate={(value) => setValue(HAPPINESS, value)}
                />
              )}
              <Checkbox
                style={{ marginBottom: '42px' }}
                label={t('TASK.PREFER_NOT_TO_SAY')}
                hookFormRegister={register(PREFER_NOT_TO_SAY)}
                onChange={() => setValue(HAPPINESS, null)}
              />
            </>
          )}
        </>
      )}

      <InputAutoSize
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(TASK_ABANDONMENT_NOTES, {
          maxLength: { value: 10000, message: t('TASK.ABANDON.NOTES_CHAR_LIMIT') },
        })}
        name={TASK_ABANDONMENT_NOTES}
        label={t('TASK.ABANDON.NOTES')}
        optional
        errors={errors[TASK_ABANDONMENT_NOTES]?.message}
      />
    </Layout>
  );
};

PureAbandonTask.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
  onGoBack: PropTypes.func,
  isAssigneeTheLoggedInUser: PropTypes.bool,
  originalDueDate: PropTypes.string,
};

export default PureAbandonTask;
