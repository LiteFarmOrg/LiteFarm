import React from 'react';
import Form from '../../../components/Form';
import MultiStepPageTitle from '../../../components/PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import PureCleaningTask from '../CleaningTask';
import PureSoilAmendmentTask from '../SoilAmendmentTask';
import PureFieldWorkTask from '../FieldWorkTask';
import PurePestControlTask from '../PestControlTask';

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
  const taskType = selectedTaskType.task_translation_key;
  const taskComponents = {
    CLEANING: (props) => (
      <PureCleaningTask farm={farm} system={system} products={products} {...props} />
    ),
    FIELD_WORK: (props) => <PureFieldWorkTask {...props} />,
    SOIL_AMENDMENT: (props) => (
      <PureSoilAmendmentTask farm={farm} system={system} products={products} {...props} />
    ),
    PEST_CONTROL: (props) => (
      <PurePestControlTask farm={farm} system={system} products={products} {...props} />
    ),
  };
  const defaults = {
    CLEANING: { cleaning_task: { agent_used: false } },
  };

  const formFunctions = useForm({
    mode: 'onChange',
    defaultValues: {
      notes: persistedFormData?.notes,
      ...defaults[taskType],
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
  const NOTES = 'notes';
  register(NOTES, { required: false });

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

        <Main style={{ marginBottom: '24px' }}>
          {t('ADD_TASK.TELL_US_ABOUT_YOUR_TASK_TYPE_ONE') +
            ' ' +
            t(`task:${taskType}_LOWER`) +
            ' ' +
            t('ADD_TASK.TASK')}
        </Main>
        {taskComponents[taskType]({
          setValue,
          getValues,
          watch,
          control,
          register,
        })}
        <Input
          style={{ paddingTop: '20px' }}
          label={t('LOG_COMMON.NOTES')}
          optional={true}
          hookFormRegister={register(NOTES)}
          name={NOTES}
        />
      </Form>
    </>
  );
};

export default PureTaskDetails;
