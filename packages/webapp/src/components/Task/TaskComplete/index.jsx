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
import Input, { getInputErrors } from '../../Form/Input';
import { getDateInputFormat } from '../../../util/moment';
import { isNotInFuture } from '../../Form/Input/utils';
import { useIsTaskType } from '../../../containers/Task/useIsTaskType';
import { ORIGINAL_DUE_DATE, TODAY_DUE_DATE, ANOTHER_DUE_DATE } from '../AbandonTask/constants';
import { TASK_TYPE_PRODUCT_MAP } from '../../../containers/Task/constants';
import { isSameDay } from '../../../util/date-migrate-TS';
import { getLocalDateInYYYYDDMM } from '../../../util/date';

export const DURATION = 'duration';
export const COMPLETION_NOTES = 'completion_notes';
export const HAPPINESS = 'happiness';
export const PREFER_NOT_TO_SAY = 'prefer_not_to_say';
export const DATE_CHOICE = 'date_choice';
export const ANOTHER_DATE = 'date_another';

const formatDefaultValues = (persistedFormData, dueDateDisabled) => {
  if (persistedFormData[DATE_CHOICE]) {
    return persistedFormData;
  }

  const completeDate = persistedFormData?.complete_date;
  let dateChoice;
  let anotherDate = '';

  if (!completeDate) {
    dateChoice = dueDateDisabled ? TODAY_DUE_DATE : ORIGINAL_DUE_DATE;
  } else if (isSameDay(new Date(completeDate), new Date())) {
    dateChoice = TODAY_DUE_DATE;
  } else if (completeDate === persistedFormData.due_date) {
    dateChoice = ORIGINAL_DUE_DATE;
  } else {
    dateChoice = ANOTHER_DUE_DATE;
    anotherDate = getLocalDateInYYYYDDMM(new Date(completeDate));
  }

  return {
    ...persistedFormData,
    [DATE_CHOICE]: dateChoice,
    [ANOTHER_DATE]: anotherDate,
    [PREFER_NOT_TO_SAY]: completeDate && !persistedFormData?.happiness,
  };
};

export default function PureTaskComplete({
  onSave,
  onGoBack,
  persistedFormData,
  useHookFormPersist,
}) {
  const { t } = useTranslation();

  // Prepare dates
  const date_due = getDateInputFormat(persistedFormData?.due_date);
  const date_today = getDateInputFormat();
  const dueDateDisabled = date_due >= date_today;

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
    defaultValues: formatDefaultValues(persistedFormData, dueDateDisabled),
  });

  const date_choice = watch(DATE_CHOICE); // Radiobox Group choice

  const { historyCancel } = useHookFormPersist(getValues);

  const progress = 66;

  const duration = watch(DURATION);
  const prefer_not_to_say = watch(PREFER_NOT_TO_SAY);
  const happiness = watch(HAPPINESS);

  const notes = watch(COMPLETION_NOTES);

  const disabled = !isValid || (!happiness && !prefer_not_to_say);

  const isIrrigationTask = useIsTaskType('IRRIGATION_TASK');

  let task_type_name = persistedFormData?.taskType?.task_translation_key.toLowerCase();

  const format = (formData) => {
    let completeDate = '';
    switch (formData[DATE_CHOICE]) {
      case TODAY_DUE_DATE:
        completeDate = date_today;
        break;
      case ANOTHER_DUE_DATE:
        completeDate = formData[ANOTHER_DATE];
        break;
      case ORIGINAL_DUE_DATE:
      default:
        completeDate = date_due;
        break;
    }

    let data = {
      taskData: {
        duration: duration,
        happiness: prefer_not_to_say ? null : happiness,
        completion_notes: notes,
        complete_date: completeDate,
      },
      task_translation_key: persistedFormData?.taskType?.task_translation_key,
      isCustomTaskType: !!persistedFormData?.taskType?.farm_id,
    };

    // Include animalIds if need_changes is true and animalIds are present (otherwise omit property to keep associated animals unchanged)
    if (persistedFormData?.need_changes && formData.animalIds) {
      data.animalIds = formData.animalIds;
    }

    const isFieldWork = task_type_name === 'field_work_task';
    const isOtherFieldWork =
      isFieldWork && persistedFormData?.field_work_task?.field_work_task_type.value === 'OTHER';

    // Won't send task type details if need_changes is false
    if (!data.isCustomTaskType && persistedFormData?.need_changes && !isOtherFieldWork) {
      data.taskData[task_type_name] = getObjectInnerValues(persistedFormData[task_type_name]);
    } else if (isOtherFieldWork) {
      data.taskData[task_type_name] = { ...persistedFormData[task_type_name] };
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
    if (isIrrigationTask && persistedFormData?.locations?.length) {
      data.location_id = persistedFormData?.locations[0].location_id;
    }

    if (persistedFormData?.need_changes && isIrrigationTask) {
      const irrigationType = formData.irrigation_task.irrigation_type;
      data.taskData.irrigation_task.irrigation_type_name =
        irrigationType.value === 'OTHER'
          ? data.taskData.irrigation_task.irrigation_task_type_other
          : irrigationType.value;

      if (irrigationType.value !== 'OTHER') {
        data.taskData.irrigation_task.irrigation_type_id = irrigationType.irrigation_type_id;
      }
    }

    // Won't send task type details if need_changes is false
    if (persistedFormData?.need_changes && TASK_TYPE_PRODUCT_MAP[data.task_translation_key]) {
      const taskProductKey = TASK_TYPE_PRODUCT_MAP[data.task_translation_key];
      data[taskProductKey] = persistedFormData?.[taskProductKey];
    }

    if (task_type_name === 'soil_sample_task' && persistedFormData?.results_available) {
      data.uploadedFiles = persistedFormData?.uploadedFiles ?? [];
    }

    return data;
  };

  const onSubmit = (event) => {
    event.preventDefault();

    // When a soil amendment task is completed without changes, allow the user to complete the task even if isValid is false
    // (handleSubmit does not work if isValid is false)
    if (task_type_name === 'soil_amendment_task' && persistedFormData?.need_changes === false) {
      const formData = getValues();
      onSave(format(formData));
    } else {
      handleSubmit((data) => onSave(format(data)))();
    }
  };

  return (
    <Form
      buttonGroup={
        <Button data-cy="harvestComplete-save" type={'submit'} disabled={disabled} fullLength>
          {t('common:SAVE')}
        </Button>
      }
      onSubmit={onSubmit}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={historyCancel}
        title={t('TASK.COMPLETE_TASK')}
        value={progress}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE.WHEN')}</Main>

      <RadioGroup
        hookFormControl={control}
        required
        style={{ marginBottom: date_choice == ANOTHER_DUE_DATE ? '12px' : '24px' }}
        name={DATE_CHOICE}
        radios={[
          {
            label: t('TASK.ABANDON.DATE_ORIGINAL'),
            disabled: dueDateDisabled,
            pill: date_due,
            value: ORIGINAL_DUE_DATE,
          },
          {
            label: t('TASK.ABANDON.DATE_TODAY'),
            pill: date_today,
            value: TODAY_DUE_DATE,
          },
          {
            label: t('TASK.ABANDON.DATE_ANOTHER'),
            value: ANOTHER_DUE_DATE,
          },
        ]}
      />

      {date_choice == ANOTHER_DUE_DATE && (
        <Input
          autoFocus
          hookFormRegister={register(ANOTHER_DATE, {
            required: true,
            validate: isNotInFuture,
          })}
          label={t('TASK.ABANDON.WHICH_DATE')}
          errors={getInputErrors(errors, ANOTHER_DATE)}
          style={{ marginBottom: '24px' }}
          type={'date'}
          max={date_today}
          required
          openCalendar
        />
      )}

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
