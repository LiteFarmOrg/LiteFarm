import Layout from '../../Layout';
import Button from '../../Form/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../PageTitle/v2';
import Input from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import LocationViewer from '../../LocationViewer';
import { Label, Main, Semibold, Underlined } from '../../Typography';
import styles from './styles.module.scss';
import PureManagementPlanTile from '../../CropTile/ManagementPlanTile';
import PureCropTileContainer from '../../CropTile/CropTileContainer';
import useCropTileListGap from '../../CropTile/useCropTileListGap';
import PageBreak from '../../PageBreak';
import { useForm } from 'react-hook-form';
import TimeSlider from '../../Form/Slider/TimeSlider';
import Rating from '../../Rating';
import Checkbox from '../../Form/Checkbox';
import { cloneObject } from '../../../util';
import PureCleaningTask from '../CleaningTask';
import PureFieldWorkTask from '../FieldWorkTask';
import PureSoilAmendmentTask from '../SoilAmendmentTask';
import PurePestControlTask from '../PestControlTask';
import { PureHarvestingTaskReadOnly, PureHavestTaskCompleted } from '../HarvestingTask/ReadOnly';
import { PurePlantingTask } from '../PlantingTask';

export default function PureTaskReadOnly({
  onGoBack,
  onComplete,
  onEdit,
  onAbandon,
  task,
  users,
  user,
  isAdmin,
  system,
  products,
  managementPlansByLocationIds,
  harvestUseTypes,
}) {
  const { t } = useTranslation();
  const hasManagementPlans = task.managementPlans?.length > 0;
  const taskType = task.taskType;
  const dueDate = task.due_date.split('T')[0];
  const locations = task.locations.map(({ location_id }) => location_id);
  const owner = task.owner_user_id;
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
    defaultValues: cloneObject(task),
  });

  const taskAfterCompleteComponents = {
    HARVEST_TASK: (props) => (
      <PureHavestTaskCompleted system={system} {...props} harvestUseTypes={harvestUseTypes} />
    ),
  };

  const self = user.user_id;

  let assignee = null;
  for (let user of users) {
    if (user.user_id === task.assignee_user_id) {
      assignee = user.first_name + ' ' + user.last_name;
    }
  }

  const { ref: gap, padding } = useCropTileListGap([]);

  const isCompleted = !!task.completed_time;
  return (
    <Layout
      buttonGroup={
        self === task.assignee_user_id &&
        !isCompleted && (
          <>
            <Button color={'primary'} onClick={onComplete} fullLength>
              {t('common:MARK_COMPLETE')}
            </Button>
          </>
        )
      }
    >
      <PageTitle
        onGoBack={onGoBack}
        style={{ marginBottom: '24px' }}
        title={t(`task:${taskType.task_translation_key}`) + ' ' + t('TASK.TASK')}
        onEdit={(isAdmin || owner === self) && !isCompleted ? onEdit : false}
        editLink={t('TASK.EDIT_TASK')}
      />

      <Input
        style={{ marginBottom: '40px' }}
        label={t('ADD_TASK.ASSIGNEE')}
        disabled={true}
        value={assignee ? assignee : t('TASK.UNASSIGNED')}
      />

      <Input
        style={{ marginBottom: '40px' }}
        type={'date'}
        value={dueDate}
        label={t('TASK.DUE_DATE')}
        disabled
      />

      <Label style={{ marginBottom: '12px' }}>{t('TASK.LOCATIONS')}</Label>

      <LocationViewer className={styles.mapContainer} viewLocations={locations} />

      {hasManagementPlans &&
        task.locations.map((location) => {
          const { name: location_name, location_id } = location;
          return (
            <div key={location_id}>
              <div style={{ paddingBottom: '16px' }}>
                <PageBreak label={location_name} />
              </div>
              <PureCropTileContainer gap={gap} padding={padding}>
                {managementPlansByLocationIds[location_id]?.map((managementPlan) => {
                  return (
                    <PureManagementPlanTile
                      key={managementPlan.management_plan_id}
                      managementPlan={managementPlan}
                      date={managementPlan.firstTaskDate}
                      status={managementPlan.status}
                    />
                  );
                })}
              </PureCropTileContainer>
            </div>
          );
        })}

      <Semibold style={{ marginTop: '8px', marginBottom: '18px' }}>
        {t(`task:${taskType.task_translation_key}`) + ' ' + t('TASK.DETAILS')}
      </Semibold>

      {taskComponents[taskType.task_translation_key] !== undefined &&
        taskComponents[taskType.task_translation_key]({
          setValue,
          getValues,
          watch,
          control,
          register,
          errors,
          disabled: true,
          farm: user,
          system,
          products,
          task,
        })}
      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('common:NOTES')}
        value={task.notes}
        optional
        disabled
      />
      {isCompleted && (
        <div>
          <Semibold style={{ marginBottom: '24px' }}>{t('TASK.COMPLETION_DETAILS')}</Semibold>
          <TimeSlider
            style={{ marginBottom: '40px' }}
            label={t('TASK.DURATION')}
            initialTime={task.duration}
            setValue={() => {}}
            disabled={true}
          />
          <Main style={{ marginBottom: '24px' }}>{t('TASK.DID_YOU_ENJOY')}</Main>
          {task.happiness > 0 && (
            <div>
              <Label style={{ marginBottom: '12px' }}>{t('TASK.RATE_THIS_TASK')}</Label>
              <Rating
                className={styles.rating}
                style={{ width: '24px', height: '24px' }}
                viewOnly={true}
                stars={task.happiness}
              />
            </div>
          )}
          {!task.happiness && (
            <Checkbox label={t('TASK.PREFER_NOT_TO_SAY')} disabled defaultChecked />
          )}
          <InputAutoSize
            style={{ marginTop: '40px', marginBottom: '40px' }}
            label={t('TASK.COMPLETION_NOTES')}
            value={task.completion_notes}
            optional
            disabled
          />
          {taskAfterCompleteComponents[taskType.task_translation_key] !== undefined &&
            taskAfterCompleteComponents[taskType.task_translation_key]({
              setValue,
              getValues,
              watch,
              control,
              register,
              errors,
              disabled: true,
              farm: user,
              system,
              products,
              task,
              isCompleted,
            })}
        </div>
      )}

      {(self === task.assignee_user_id || self === owner || isAdmin) && !isCompleted && (
        <Underlined style={{ marginBottom: '16px' }} onClick={onAbandon}>
          {t('TASK.ABANDON_TASK')}
        </Underlined>
      )}
    </Layout>
  );
}

const taskComponents = {
  CLEANING_TASK: (props) => <PureCleaningTask {...props} />,
  FIELD_WORK_TASK: (props) => <PureFieldWorkTask {...props} />,
  SOIL_AMENDMENT_TASK: (props) => <PureSoilAmendmentTask {...props} />,
  PEST_CONTROL_TASK: (props) => <PurePestControlTask {...props} />,
  PLANT_TASK: (props) => <PurePlantingTask disabled isPlantTask={true} {...props} />,
  TRANSPLANT_TASK: (props) => <PurePlantingTask disabled isPlantTask={false} {...props} />,
  HARVEST_TASK: (props) => <PureHarvestingTaskReadOnly {...props} />,
};
