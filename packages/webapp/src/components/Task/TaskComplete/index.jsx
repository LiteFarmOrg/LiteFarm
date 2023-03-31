import React from 'react';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import { Main } from '../../Typography';
import TimeSlider from '../../Form/Slider/TimeSlider';
import Checkbox from '../../Form/Checkbox';
import InputAutoSize from '../../Form/InputAutoSize';
import RadioGroup from '../../Form/RadioGroup';
import Rating from '../../Rating';
import styles from './styles.module.scss';
import { getObjectInnerValues } from '../../../util';
import Input from '../../Form/Input';
import { getDateInputFormat } from '../../../util/moment';
import { isNotInFuture } from '../../Form/Input/utils';
import { useIsTaskType } from '../../../containers/Task/useIsTaskType';

export default function PureTaskComplete({
  onSave,
  onGoBack,
  persistedFormData,
  useHookFormPersist,
}) {
  const DURATION = 'duration';
  const COMPLETION_NOTES = 'completion_notes';
  const HAPPINESS = 'happiness';
  const PREFER_NOT_TO_SAY = 'prefer_not_to_say';
  const DATE_CHOICE = 'date_choice';
  const ANOTHER_DATE = 'date_another';

  const { t } = useTranslation();

  // Prepare dates
  const date_due = getDateInputFormat(persistedFormData.due_date);
  const date_today = getDateInputFormat();
  const dueDateDisabled = date_due >= date_today;
  const date_default = dueDateDisabled ? date_today : date_due;

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { 
      [DATE_CHOICE]: date_default,
      [ANOTHER_DATE]: date_default,
      ...persistedFormData,
    },
  });

  const date_choice = watch(DATE_CHOICE); // Radiobox Group choice
  const date_another = watch(ANOTHER_DATE); // Datepicker date, if date_choice == ANOTHER_DATE

  const { historyCancel } = useHookFormPersist(getValues);

  const progress = 66;

  const duration = watch(DURATION);
  const prefer_not_to_say = watch(PREFER_NOT_TO_SAY);
  const happiness = watch(HAPPINESS);

  const notes = watch(COMPLETION_NOTES);

  const disabled = !isValid || (!happiness && !prefer_not_to_say);

  const isIrrigationLocation = useIsTaskType('IRRIGATION_TASK');

  return (
    <Form
      buttonGroup={
        <Button data-cy="harvestComplete-save" type={'submit'} disabled={disabled} fullLength>
          {t('common:SAVE')}
        </Button>
      }
      onSubmit={handleSubmit((formData) => {
        let data = {
          taskData: {
            duration: duration,
            happiness: prefer_not_to_say ? null : happiness,
            completion_notes: notes,
            complete_date: date_choice == ANOTHER_DATE ? date_another : date_choice,
          },
          task_translation_key: persistedFormData?.taskType.task_translation_key,
          isCustomTaskType: !!persistedFormData?.taskType.farm_id,
        };
        let task_type_name = persistedFormData?.taskType.task_translation_key.toLowerCase();
        if (persistedFormData?.need_changes) {
          data.taskData[task_type_name] = getObjectInnerValues(persistedFormData[task_type_name]);
        }
        //TODO: replace with useIsTaskType
        if (task_type_name === 'harvest_task') {
          data.harvest_uses = persistedFormData?.harvest_uses;
          data.taskData[task_type_name] = {
            ...persistedFormData?.harvest_task,
            actual_quantity: persistedFormData?.actual_quantity,
            actual_quantity_unit: persistedFormData?.actual_quantity_unit.value,
          };
        }
        if (isIrrigationLocation)
          data.location_id = persistedFormData.locations[0].location_id;
        onSave(data);
      })}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('TASK.COMPLETE_TASK_FLOW')}
        title={t('TASK.COMPLETE_TASK')}
        value={progress}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE.WHEN')}</Main>

      <RadioGroup 
        hookFormControl={control} 
        required 
        style={{ marginBottom: date_choice == ANOTHER_DATE ? '12px' : '24px' }}
        name={DATE_CHOICE}
        radios={[
          {
            label: t('TASK.ABANDON.DATE_ORIGINAL'),
            disabled: dueDateDisabled,
            pill:  date_due,
            // Avoid duplicate keys when date_due == date_today
            value: dueDateDisabled ? false : date_due,
          },
          {
            label: t('TASK.ABANDON.DATE_TODAY'),
            pill: date_today,
            value: date_today,
          },
          {
            label: t('TASK.ABANDON.DATE_ANOTHER'),
            value: ANOTHER_DATE,
          },
        ]}
      />

      {date_choice == ANOTHER_DATE &&
        <Input
          autoFocus
          hookFormRegister={register(ANOTHER_DATE, {
            required: true,
            validate: isNotInFuture,
          })}
          label={t('TASK.ABANDON.WHICH_DATE')}
          errors={errors[ANOTHER_DATE] ? isNotInFuture() : null}
          style={{ marginBottom: '24px' }}
          type={'date'}
          max={date_today}
          // Remove any error with try catch block if showPicker isn't supported.
          // It also fails on non-user-activated focus eg refresh after
          // having selected Another date => non-user-activated autofocus
          onFocus={e => { try {e.target.showPicker()} catch {} }}
          required
        />
      }

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE_TASK_DURATION')}</Main>

      <TimeSlider
        style={{ marginBottom: '40px' }}
        label={t('TASK.DURATION')}
        setValue={(durationInMinutes) => setValue(DURATION, durationInMinutes)}
        initialTime={persistedFormData?.duration}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.DID_YOU_ENJOY')}</Main>

      {!prefer_not_to_say && (
        <Rating
          className={styles.rating}
          style={{ marginBottom: '27px' }}
          label={t('TASK.PROVIDE_RATING')}
          disabled={prefer_not_to_say}
          initialRating={persistedFormData?.happiness}
          onRate={(value) => setValue(HAPPINESS, value)}
        />
      )}

      <Checkbox
        data-cy="harvestComplete-rating"
        style={{ marginBottom: '42px' }}
        label={t('TASK.PREFER_NOT_TO_SAY')}
        hookFormRegister={register(PREFER_NOT_TO_SAY)}
        onChange={() => setValue(HAPPINESS, null)}
      />

      <InputAutoSize
        hookFormRegister={register(COMPLETION_NOTES, {
          maxLength: { value: 10000, message: t('TASK.COMPLETION_NOTES_CHAR_LIMIT') },
        })}
        name={COMPLETION_NOTES}
        label={t('TASK.COMPLETION_NOTES')}
        optional
        errors={errors[COMPLETION_NOTES]?.message}
      />
    </Form>
  );
}
