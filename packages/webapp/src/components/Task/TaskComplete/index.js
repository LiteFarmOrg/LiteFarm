import React, { useState } from 'react';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import { Main } from '../../Typography';
import TimeSlider from '../../Form/Slider/TimeSlider';
import Checkbox from '../../Form/Checkbox';
import InputAutoSize from '../../Form/InputAutoSize';


export default function PureTaskComplete({
  onSave,
  onCancel,
  onGoBack,
  persistedFormData,
}) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { ...persistedFormData },
  });

  const disabled = !isValid;

  const progress = 12;

  const DURATION = 'duration';
  const COMPLETION_NOTES = 'completion_notes';

  const PREFER_NOT_TO_SAY = 'prefer_not_to_say';
  const prefer_not_to_say = watch(PREFER_NOT_TO_SAY);

  console.log(prefer_not_to_say);

  const [duration, _setDuration] = useState({ hours: 0, minutes: 0 });
  const setDuration = (value) => {
    _setDuration(value > 0 ? value : '');
  };

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={disabled} fullLength>
          {t('common:SAVE')}
        </Button>
      }
      onSubmit={handleSubmit(() => { console.log(prefer_not_to_say) })}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('TASK.ADD_TASK_FLOW')}
        title={t('TASK.COMPLETE_TASK')}
        value={progress}
      />

      <Main style={{ marginBottom: '24px' }}>
        {t('TASK.COMPLETE_TASK_DURATION')}
      </Main>

      <TimeSlider
        style={{ marginBottom: '40px' }}
        label={t('TASK.DURATION')}
        setValue={(durationInMinutes) => {
          setDuration(durationInMinutes);
        }}
      />

      <Main style={{ marginBottom: '24px' }}>
        {t('TASK.DID_YOU_ENJOY')}
      </Main>

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
  )
}

