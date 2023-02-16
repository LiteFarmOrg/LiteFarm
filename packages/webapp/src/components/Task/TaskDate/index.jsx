import React from 'react';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import { Main } from '../../Typography';

export default function PureTaskDate({
  onContinue,
  onGoBack,
  persistedFormData,
  useHookFormPersist,
}) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { ...persistedFormData },
  });

  const progress = 28;

  const { historyCancel } = useHookFormPersist(getValues);

  const DUE_DATE = 'due_date';
  const date = watch(DUE_DATE);

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button data-cy="addTask-continue" type={'submit'} disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onContinue(date))}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('TASK.ADD_TASK_FLOW')}
        title={t('MANAGEMENT_DETAIL.ADD_A_TASK')}
        value={progress}
      />

      <Main style={{ marginBottom: '16px' }}>{t('TASK.SELECT_DATE')}</Main>

      <Input
        openCalendar
        autoFocus
        data-cy="addTask-taskDate"
        type={'date'}
        label={t('common:DATE')}
        hookFormRegister={register(DUE_DATE, {
          required: true,
        })}
        errors={errors[DUE_DATE] && t('common:REQUIRED')}
      />
    </Form>
  );
}

PureTaskDate.prototype = {
  onContinue: PropTypes.func,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
};
