import Button from '../../Form/Button';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import React from 'react';
import Form from '../../Form';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import RadioGroup from '../../Form/RadioGroup';
import PureCleaningTask from '../CleaningTask';
import PureSoilAmendmentTask from '../SoilAmendmentTask';
import PureFieldWorkTask from '../FieldWorkTask';
import PurePestControlTask from '../PestControlTask';
import { cloneObject } from '../../../util';
import { PurePlantingTask } from '../PlantingTask';

export default function PureCompleteStepOne({
  persistedFormData,
  onContinue,
  onGoBack,
  onCancel,
  selectedTaskType,
  selectedTask,
  farm,
  system,
  products,
  persistedPaths,
  useHookFormPersist,
}) {
  const { t } = useTranslation();
  const defaultsToUse = persistedFormData.need_changes
    ? cloneObject(persistedFormData)
    : cloneObject(selectedTask);
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { need_changes: false, ...defaultsToUse },
  });

  useHookFormPersist(getValues, persistedPaths);
  const CHANGES_NEEDED = 'need_changes';
  const changesRequired = watch(CHANGES_NEEDED);
  const taskType = selectedTaskType?.task_translation_key;

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onContinue)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('TASK.COMPLETE_TASK_FLOW')}
        title={t('TASK.COMPLETE_TASK')}
        value={33}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE_TASK_CHANGES')}</Main>
      <RadioGroup hookFormControl={control} required name={CHANGES_NEEDED} />
      {taskType &&
        taskComponents[taskType]({
          setValue,
          getValues,
          watch,
          control,
          register,
          formState: { errors, isValid },
          errors,
          system,
          products,
          farm,
          task: selectedTask,
          disabled: !changesRequired,
        })}
    </Form>
  );
}

const taskComponents = {
  CLEANING_TASK: (props) => <PureCleaningTask {...props} />,
  FIELD_WORK_TASK: (props) => <PureFieldWorkTask {...props} />,
  SOIL_AMENDMENT_TASK: (props) => <PureSoilAmendmentTask {...props} />,
  PEST_CONTROL_TASK: (props) => <PurePestControlTask {...props} />,
  PLANT_TASK: (props) => <PurePlantingTask disabled isPlantTask={true} {...props} />,
  TRANSPLANT_TASK: (props) => <PurePlantingTask disabled isPlantTask={false} {...props} />,
};
