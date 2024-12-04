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
import { PurePlantingTask } from '../PlantingTask';
import PureIrrigationTask from '../PureIrrigationTask';
import { formatTaskReadOnlyDefaultValues } from '../../../util/task';
import PureMovementTask from '../MovementTask';

const soilAmendmentContinueDisabled = (needsChange, isValid) => {
  if (!needsChange) {
    return false;
  }
  return !isValid;
};

export default function PureCompleteStepOne({
  persistedFormData,
  onContinue,
  onGoBack,
  selectedTaskType,
  selectedTask,
  farm,
  system,
  products,
  useHookFormPersist,
}) {
  const { t } = useTranslation();
  const defaultsToUse = formatTaskReadOnlyDefaultValues(
    persistedFormData.need_changes ? persistedFormData : selectedTask,
  );
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    control,
    setValue,
    reset,
    getFieldState,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { need_changes: false, ...defaultsToUse },
  });

  const { historyCancel } = useHookFormPersist(getValues);

  const CHANGES_NEEDED = 'need_changes';
  const changesRequired = watch(CHANGES_NEEDED);
  const taskType = selectedTaskType?.task_translation_key;

  const continueDisabled =
    taskType === 'SOIL_AMENDMENT_TASK'
      ? soilAmendmentContinueDisabled(getValues(CHANGES_NEEDED), isValid)
      : !isValid;

  const onSubmit = (event) => {
    event.preventDefault();

    if (
      taskType === 'SOIL_AMENDMENT_TASK' &&
      soilAmendmentContinueDisabled(getValues(CHANGES_NEEDED)) === false
    ) {
      onContinue();
    } else {
      handleSubmit(onContinue)();
    }
  };

  return (
    <Form
      buttonGroup={
        <Button
          data-cy="beforeComplete-submit"
          type={'submit'}
          disabled={continueDisabled}
          fullLength
        >
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={onSubmit}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={historyCancel}
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
          reset,
          getFieldState,
          formState: { errors, isValid },
          errors,
          system,
          products,
          farm,
          task: selectedTask,
          disabled: !changesRequired,
          isModified: changesRequired,
          locations: selectedTask.locations,
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
  IRRIGATION_TASK: (props) => <PureIrrigationTask {...props} />,
  MOVEMENT_TASK: (props) => <PureMovementTask {...props} />,
};
