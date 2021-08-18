import React from 'react';
import Form from '../../../components/Form';
import MultiStepPageTitle from '../../../components/PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import PureCleaningTask from '../CleaningTask';

const PureTaskDetails = ({
  handleGoBack,
  handleCancel,
  onSubmit,
  onError,
  persistedFormData,
  useHookFormPersist,
  persistedPaths,
  products,
  system,
  selectedTaskType,
  farm,
}) => {
  const { t } = useTranslation();

  const formFunctions = useForm({
    defaultValues: {
      task_notes: persistedFormData?.task_notes,
      ...persistedFormData,
    },
  });

  const {
    handleSubmit,
    watch,
    register,
    setValue,
    getValues,
    control,
    formState: { errors, isValid },
  } = formFunctions;

  useHookFormPersist(getValues, persistedPaths);
  const TASK_NOTES = 'task_notes';
  register(TASK_NOTES, { required: false });
  const taskType = selectedTaskType.task_translation_key;

  return (
    <>
      <Form
        buttonGroup={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: '16px', flexGrow: 1 }}>
            <Button color={'primary'} disabled={!isValid} fullLength>
              {t('common:CONTINUE')}
            </Button>
          </div>
        }
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <MultiStepPageTitle
          style={{ marginBottom: '24px' }}
          onGoBack={handleGoBack}
          onCancel={handleCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={71}
        />

        <Main>
          {t('ADD_TASK.TELL_US_ABOUT_YOUR_TASK_TYPE_ONE') +
            ' ' +
            t(`task:${taskType}`) +
            ' ' +
            t('ADD_TASK.TASK')}
        </Main>
        {taskType === 'CLEANING' && (
          <PureCleaningTask
            setValue={setValue}
            getValues={getValues}
            watch={watch}
            control={control}
            products={products}
            system={system}
            register={register}
            farm={farm}
          />
        )}
        <Input
          style={{ paddingTop: '20px' }}
          label={t('LOG_COMMON.NOTES')}
          optional={true}
          hookFormRegister={register(TASK_NOTES)}
          name={TASK_NOTES}
        />
      </Form>
    </>
  );
};

export default PureTaskDetails;
