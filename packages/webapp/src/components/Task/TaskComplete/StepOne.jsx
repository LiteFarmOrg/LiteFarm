import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import styles from './styles.module.scss';
import Button from '../../Form/Button';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import Form from '../../Form';
import RadioGroup from '../../Form/RadioGroup';
import PureCleaningTask from '../CleaningTask';
import PureSoilAmendmentTask from '../SoilAmendmentTask';
import PureFieldWorkTask from '../FieldWorkTask';
import PurePestControlTask from '../PestControlTask';
import { PurePlantingTask } from '../PlantingTask';
import PureIrrigationTask from '../PureIrrigationTask';
import PureSoilSampleTask from '../SoilSampleTask';
import {
  formatTaskAnimalsAsInventoryIds,
  formatTaskReadOnlyDefaultValues,
} from '../../../util/task';
import PureMovementTask from '../MovementTask';
import AnimalInventory, { View } from '../../../containers/Animals/Inventory';
import { ANIMAL_IDS } from '../TaskAnimalInventory';
import FilePicker from '../../FilePicker';

const soilAmendmentContinueDisabled = (needsChange, isValid) => {
  if (!needsChange) {
    return false;
  }
  return !isValid;
};

const getFieldsToKeep = (taskType) => {
  if (!taskType || taskType.farm_id) {
    return [];
  }
  return [taskType.task_translation_key.toLowerCase()];
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
  filePickerFunctions,
  isUploading,
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
    defaultValues: {
      need_changes: false,
      ...defaultsToUse,
      ...(persistedFormData[ANIMAL_IDS] && { [ANIMAL_IDS]: persistedFormData[ANIMAL_IDS] }),
      results_available: persistedFormData.uploadedFiles?.length ? true : false,
    },
  });

  const watchedSelectedAnimals = watch(ANIMAL_IDS) || [];
  const noAnimalsSelected = !watchedSelectedAnimals.length;

  const {
    persistedData: { uploadedFiles },
    historyCancel,
  } = useHookFormPersist(getValues, [], getFieldsToKeep(selectedTaskType));

  const CHANGES_NEEDED = 'need_changes';
  const changesRequired = watch(CHANGES_NEEDED);

  const RESULTS_AVAILABLE = 'results_available';
  const resultsAvailable = watch(RESULTS_AVAILABLE);

  const taskType = selectedTaskType?.task_translation_key;

  const continueDisabled = (() => {
    switch (taskType) {
      case 'SOIL_AMENDMENT_TASK':
        return soilAmendmentContinueDisabled(changesRequired, isValid);
      case 'MOVEMENT_TASK':
        return !isValid || (changesRequired && noAnimalsSelected);
      case 'SOIL_SAMPLE_TASK':
        return !isValid || (resultsAvailable && !uploadedFiles?.length) || isUploading;
      default:
        return !isValid;
    }
  })();

  const onSubmit = (event) => {
    event.preventDefault();

    if (
      taskType === 'SOIL_AMENDMENT_TASK' &&
      soilAmendmentContinueDisabled(getValues(CHANGES_NEEDED)) === false
    ) {
      onContinue();
    } else {
      if (!resultsAvailable && uploadedFiles?.length) {
        for (const file of uploadedFiles) {
          filePickerFunctions.deleteImage(file.url);
        }
      }
      handleSubmit(onContinue)();
    }
  };

  const onSelectAnimals = (selectedAnimalIds) => {
    setValue(ANIMAL_IDS, selectedAnimalIds);
  };

  const hasAnimals = selectedTask.animals?.length || selectedTask.animal_batches?.length;

  useEffect(() => {
    if (hasAnimals && !changesRequired) {
      setValue(
        ANIMAL_IDS,
        formatTaskAnimalsAsInventoryIds(selectedTask.animals, selectedTask.animal_batches),
      );
    }
  }, [changesRequired]);

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
        title={t('TASK.COMPLETE_TASK')}
        value={33}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE_TASK_CHANGES')}</Main>
      <RadioGroup hookFormControl={control} required name={CHANGES_NEEDED} />

      {hasAnimals ? (
        <div className={styles.animalInventorySection}>
          <AnimalInventory
            view={View.TASK_SUMMARY}
            preSelectedIds={watchedSelectedAnimals}
            showLinks={false}
            showOnlySelected={true}
            isCompleteView={true}
            hideNoResultsBlock={true}
          />
          {taskType === 'MOVEMENT_TASK' && noAnimalsSelected && (
            <Main className={styles.noAnimalsSelectedWarning}>
              {t('TASK.ANIMALS_AT_LEAST_ONE_TO_COMPLETE')}
            </Main>
          )}
          {changesRequired && (
            <div className={styles.animalInventoryWrapper}>
              <AnimalInventory
                onSelect={onSelectAnimals}
                view={View.TASK}
                preSelectedIds={watchedSelectedAnimals}
                showLinks={false}
                showOnlySelected={false}
                isCompleteView={true}
              />
            </div>
          )}
        </div>
      ) : null}

      {taskType && taskComponents[taskType]
        ? taskComponents[taskType]({
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
          })
        : null}
      {taskType === 'SOIL_SAMPLE_TASK' && (
        <div>
          <Main style={{ marginBottom: '24px' }}>{t('TASK.DID_YOU_GET_RESULTS')}</Main>
          <RadioGroup hookFormControl={control} required name={RESULTS_AVAILABLE} />
          {resultsAvailable && (
            <FilePicker
              uploadedFiles={uploadedFiles}
              linkText={t(`TASK.UPLOAD_LAB_DOCUMENT`)}
              showLoading={isUploading}
              {...filePickerFunctions}
              showUploader={!uploadedFiles || uploadedFiles?.length < 5}
            />
          )}
        </div>
      )}
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
  MOVEMENT_TASK: (props) => <PureMovementTask disabled {...props} />,
  SOIL_SAMPLE_TASK: (props) => <PureSoilSampleTask {...props} />,
};
