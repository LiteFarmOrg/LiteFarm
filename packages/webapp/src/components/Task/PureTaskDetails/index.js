import React, { useMemo } from 'react';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import PureCleaningTask from '../CleaningTask';
import PureSoilAmendmentTask from '../SoilAmendmentTask';
import PureFieldWorkTask from '../FieldWorkTask';
import PurePestControlTask from '../PestControlTask';
import PureHarvestingTask from '../HarvestingTask';
import InputAutoSize from '../../Form/InputAutoSize';

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
  managementPlanByLocations,
}) => {
  const { t } = useTranslation();
  const taskType = selectedTaskType.task_translation_key;
  const taskName = selectedTaskType.task_name;
  const isCustomType = !!selectedTaskType.farm_id;
  const isHarvest = taskType === 'HARVEST_TASK';

  const taskComponents = {
    CLEANING_TASK: (props) => (
      <PureCleaningTask farm={farm} system={system} products={products} {...props} />
    ),
    FIELD_WORK_TASK: (props) => <PureFieldWorkTask {...props} />,
    SOIL_AMENDMENT_TASK: (props) => (
      <PureSoilAmendmentTask farm={farm} system={system} products={products} {...props} />
    ),
    PEST_CONTROL_TASK: (props) => (
      <PurePestControlTask farm={farm} system={system} products={products} {...props} />
    ),
    HARVEST_TASK: (props) => (
      <PureHarvestingTask
        persistedFormData={persistedFormData}
        system={system}
        managementPlanByLocations={managementPlanByLocations}
        {...props}
      />
    ),
  };
  const defaults = {
    CLEANING_TASK: { cleaning_task: { agent_used: false } },
  };

  const harvest_tasks = useMemo(() => {
    const harvestTasksById = persistedFormData?.harvest_tasks?.reduce(
      (harvestTasksById, harvestTask) => {
        harvestTasksById[harvestTask.id] = harvestTask;
        return harvestTasksById;
      },
      {},
    );

    return Object.keys(managementPlanByLocations).reduce((harvest_tasks, location_id) => {
      for (const managementPlan of managementPlanByLocations[location_id]) {
        const id = `${location_id}.${managementPlan.management_plan_id}`;
        harvest_tasks.push(
          harvestTasksById?.[id] || {
            id,
            harvest_everything: false,
          },
        );
      }
      return harvest_tasks;
    }, []);
  }, []);

  const formFunctions = useForm({
    mode: 'onChange',
    defaultValues: {
      ...defaults[taskType],
      ...persistedFormData,
      harvest_tasks: isHarvest ? harvest_tasks : persistedFormData?.harvest_tasks,
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
          value={isHarvest ? 67 : 71}
        />

        <Main style={{ marginBottom: isHarvest ? '16px' : '24px' }}>
          {isHarvest
            ? t('ADD_TASK.HOW_MUCH_IS_HARVESTED')
            : t('ADD_TASK.TELL_US_ABOUT_YOUR_TASK_TYPE_ONE') +
              ' ' +
              (isCustomType ? taskName.toLowerCase() : t(`task:${taskType}_LOWER`)) +
              ' ' +
              t('ADD_TASK.TASK')}
        </Main>
        {!isCustomType &&
          taskComponents[taskType]({
            setValue,
            getValues,
            watch,
            control,
            register,
          })}
        {!isHarvest && (
          <InputAutoSize
            style={{ paddingTop: '20px' }}
            label={t('LOG_COMMON.NOTES')}
            optional={true}
            hookFormRegister={register(NOTES)}
            name={NOTES}
          />
        )}
      </Form>
    </>
  );
};

export default PureTaskDetails;
