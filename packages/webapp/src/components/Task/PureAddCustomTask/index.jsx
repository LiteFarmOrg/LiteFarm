import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import Input, { getInputErrors } from '../../Form/Input';
import Button from '../../Form/Button';

const PureAddCustomTask = ({
  handleGoBack,
  history,
  useHookFormPersist,

  persistedFormData,
  onSave,
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

  const CUSTOM_TASK_TYPE = 'task_name';

  return (
    <>
      <Form
        onSubmit={handleSubmit(onSave)}
        buttonGroup={
          <Button color={'primary'} fullLength disabled={!isValid}>
            {t('common:SAVE')}
          </Button>
        }
      >
        <PageTitle
          style={{ marginBottom: '20px' }}
          onGoBack={handleGoBack}
          title={t('ADD_TASK.ADD_A_CUSTOM_TASK')}
        />

        <Input
          style={{ marginBottom: '20px' }}
          label={t('ADD_TASK.CUSTOM_TASK_TYPE')}
          hookFormRegister={register(CUSTOM_TASK_TYPE, {
            required: true,
            maxLength: { value: 25, message: t('ADD_TASK.CUSTOM_TASK_CHAR_LIMIT') },
          })}
          name={CUSTOM_TASK_TYPE}
          errors={getInputErrors(errors, CUSTOM_TASK_TYPE)}
          optional={false}
        />
      </Form>
    </>
  );
};

export default PureAddCustomTask;
