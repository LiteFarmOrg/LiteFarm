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
  onCancel,
  persistedFormData,
  useHookFormPersist,
}) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { ...persistedFormData },
  });

  const progress = 28;

  const persistedPath = ['/add_task/task_type_selection', '/add_task/task_locations'];
  useHookFormPersist(getValues, persistedPath);

  const DUE_DATE = 'due_date';

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onContinue)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('TASK.ADD_TASK_FLOW')}
        title={t('MANAGEMENT_DETAIL.ADD_A_TASK')}
        value={progress}
      />

      <Main style={{ marginBottom: '16px' }}>{t('TASK.SELECT_DATE')}</Main>

      <Input
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
