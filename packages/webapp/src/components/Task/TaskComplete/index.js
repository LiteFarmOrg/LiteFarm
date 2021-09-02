import React, { useState } from 'react';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import { Main } from '../../Typography';
import TimeSlider from '../../Form/Slider/TimeSlider';
import Checkbox from '../../Form/Checkbox';
import InputAutoSize from '../../Form/InputAutoSize';
import Rating from '../../Rating';
import styles from './styles.module.scss';
import { getObjectInnerValues } from '../../../util';

export default function PureTaskComplete({
  onSave,
  onCancel,
  onGoBack,
  persistedFormData,
  persistedPaths,
  useHookFormPersist,
}) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { ...persistedFormData },
  });

  useHookFormPersist(getValues, persistedPaths);

  const progress = 66;

  const DURATION = 'duration';
  const COMPLETION_NOTES = 'completion_notes';

  const PREFER_NOT_TO_SAY = 'prefer_not_to_say';
  const prefer_not_to_say = watch(PREFER_NOT_TO_SAY);

  const HAPPINESS = 'happiness';

  const notes = watch(COMPLETION_NOTES);

  const [duration, _setDuration] = useState({ hours: 0, minutes: 0 });
  const setDuration = (value) => {
    _setDuration(value > 0 ? value : '');
  };

  const [rating, _setRating] = useState(
    persistedFormData?.happiness === undefined ? 0 : persistedFormData?.happiness,
  );

  const setRating = (value) => {
    _setRating(value);
    setValue(HAPPINESS, value);
  };

  const disabled = !prefer_not_to_say && rating === 0;

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={disabled} fullLength>
          {t('common:SAVE')}
        </Button>
      }
      onSubmit={handleSubmit(() => {
        let data = {
          taskData: {
            completed_time: new Date().toISOString(),
            duration: duration,
            happiness: prefer_not_to_say ? null : rating,
            completion_notes: notes,
          },
          task_translation_key: persistedFormData?.taskType.task_translation_key,
        };
        if (persistedFormData?.need_changes) {
          let task_type_name = persistedFormData?.taskType.task_translation_key.toLowerCase();
          data.taskData[task_type_name] = getObjectInnerValues(persistedFormData[task_type_name]);
        }
        onSave(data);
      })}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('TASK.ADD_TASK_FLOW')}
        title={t('TASK.COMPLETE_TASK')}
        value={progress}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE_TASK_DURATION')}</Main>

      <TimeSlider
        style={{ marginBottom: '40px' }}
        label={t('TASK.DURATION')}
        setValue={(durationInMinutes) => {
          setDuration(durationInMinutes);
          setValue(DURATION, durationInMinutes);
        }}
        initialTime={persistedFormData?.duration}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.DID_YOU_ENJOY')}</Main>

      <Rating
        className={styles.rating}
        style={{ marginBottom: '27px' }}
        label={t('TASK.PROVIDE_RATING')}
        disabled={prefer_not_to_say}
        initialRating={persistedFormData?.happiness}
        onRate={setRating}
      />

      <Checkbox
        style={{ marginBottom: '42px' }}
        label={t('TASK.PREFER_NOT_TO_SAY')}
        hookFormRegister={register(PREFER_NOT_TO_SAY)}
      />

      <InputAutoSize
        hookFormRegister={register(COMPLETION_NOTES)}
        name={COMPLETION_NOTES}
        label={t('TASK.COMPLETION_NOTES')}
        optional
      />
    </Form>
  );
}
