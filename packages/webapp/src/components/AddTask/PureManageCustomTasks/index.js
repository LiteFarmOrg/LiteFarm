import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Form from '../../Form';
import PageTitle from '../../PageTitle';
import { AddLink } from '../../Typography';

const PureManageCustomTasks = ({
  handleCancel,
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
          style={{ marginBottom: '5px' }}
          onGoBack={handleGoBack}
          title={t('ADD_TASK.MANAGE_CUSTOM_TASKS')}
        />
        <AddLink>{t('ADD_TASK.ADD_CUSTOM_TASK')}</AddLink>
      </Form>
    </>
  );
};

export default PureManageCustomTasks;
