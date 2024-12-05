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
import {
  formatTaskAnimalsAsInventoryIds,
  formatTaskReadOnlyDefaultValues,
} from '../../../util/task';
import PureMovementTask from '../MovementTask';
import AnimalInventory, { View } from '../../../containers/Animals/Inventory';
import { ANIMAL_IDS } from '../TaskAnimalInventory';

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

  const watchedSelectedAnimals = watch(ANIMAL_IDS) || [];
  const noAnimalsSelected = !watchedSelectedAnimals.length;

  const { historyCancel } = useHookFormPersist(getValues);

  const CHANGES_NEEDED = 'need_changes';
  const changesRequired = watch(CHANGES_NEEDED);
  const taskType = selectedTaskType?.task_translation_key;

  const continueDisabled = (() => {
    switch (taskType) {
      case 'SOIL_AMENDMENT_TASK':
        return soilAmendmentContinueDisabled(changesRequired, isValid);
      case 'MOVEMENT_TASK':
        return !isValid || (changesRequired && noAnimalsSelected);
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
      handleSubmit(onContinue)();
    }
  };

  const onSelectAnimals = (selectedAnimalIds) => {
    setValue(ANIMAL_IDS, selectedAnimalIds);
  };

  // Reset the initial value of the animal inventory to the original task animals
  useEffect(() => {
    setValue(
      ANIMAL_IDS,
      formatTaskAnimalsAsInventoryIds(selectedTask.animals, selectedTask.animal_batches),
    );
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
        cancelModalTitle={t('TASK.COMPLETE_TASK_FLOW')}
        title={t('TASK.COMPLETE_TASK')}
        value={33}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE_TASK_CHANGES')}</Main>
      <RadioGroup hookFormControl={control} required name={CHANGES_NEEDED} />

      {selectedTask.animals?.length || selectedTask.animal_batches?.length ? (
        <div className={styles.animalInventorySection}>
          <AnimalInventory
            onSelect={changesRequired ? onSelectAnimals : undefined}
            view={View.TASK_SUMMARY}
            preSelectedIds={
              changesRequired
                ? watchedSelectedAnimals
                : formatTaskAnimalsAsInventoryIds(selectedTask.animals, selectedTask.animal_batches)
            }
            showLinks={false}
            showOnlySelected={true}
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
