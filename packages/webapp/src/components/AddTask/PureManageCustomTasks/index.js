import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import { AddLink } from '../../Typography';

const PureManageCustomTasks = ({
  handleGoBack,
  onAddCustomTask,
  onError,
  persistedFormData,
  persistedPaths,
  useHookFormPersist,
  history,
}) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    register,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
  });

  return (
    <>
      <Form>
        <PageTitle
          style={{ marginBottom: '20px' }}
          title={t('ADD_TASK.MANAGE_CUSTOM_TASKS')}
          onGoBack={handleGoBack}
        />
        <AddLink onClick={onAddCustomTask}>{t('ADD_TASK.ADD_CUSTOM_TASK')}</AddLink>
      </Form>
    </>
  );
};

export default PureManageCustomTasks;
