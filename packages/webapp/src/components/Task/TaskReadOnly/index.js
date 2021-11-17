import Layout from '../../Layout';
import Button from '../../Form/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../PageTitle/v2';
import Input from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
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
import LocationPicker from '../../LocationPicker/SingleLocationPicker';
import { StatusLabel } from '../../CardWithStatus/StatusLabel';
import { getTaskStatus } from '../../../containers/Task/taskCardContentSelector';
import { taskStatusTranslateKey } from '../../CardWithStatus/TaskCard/TaskCard';
import { TransplantLocationLabel } from './TransplantLocationLabel/TransplantLocationLabel';
import { isTaskType } from '../../../containers/Task/useIsTaskType';
import ReactSelect from '../../Form/ReactSelect';

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
  harvestUseTypes,
  maxZoomRef,
  getMaxZoom,
}) {
  const { t } = useTranslation();
  const taskType = task.taskType;
  const dueDate = task.due_date.split('T')[0];
  const locationIds = task.locations.map(({ location_id }) => location_id);
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
  const isAbandoned = !!task.abandoned_time;
  const isCurrent = !isCompleted && !isAbandoned;
  const taskStatus = getTaskStatus(task);
  return (
    <Layout
      buttonGroup={
        self === task.assignee_user_id &&
        isCurrent && (
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
        label={
          !isCurrent && (
            <StatusLabel
              label={t(`TASK.STATUS.${taskStatusTranslateKey[taskStatus]}`)}
              color={taskStatus}
            />
          )
        }
        // TODO: Evaluate edit tasks
        // onEdit={(isAdmin || owner === self) && isCurrent ? onEdit : false}
        // editLink={t('TASK.EDIT_TASK')}
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

      <Semibold style={{ marginBottom: '12px' }}>{t('TASK.LOCATIONS')}</Semibold>
      {isTaskType(taskType, 'TRANSPLANT_TASK') && (
        <TransplantLocationLabel
          locations={task.locations}
          selectedLocationId={task.selectedLocationIds[0]}
          pinCoordinate={task.pinCoordinates[0]}
        />
      )}
      <LocationPicker

        onSelectLocation={() => {
          //  TODO: fix onSelectLocationRef in LocationPicker
        }}
        readOnlyPinCoordinates={task.pinCoordinates}
        style={{ minHeight: '160px', marginBottom: '40px' }}
        locations={task.locations}
        selectedLocationIds={task.selectedLocationIds || []}
        farmCenterCoordinate={user.grid_points}
        maxZoomRef={maxZoomRef}
        getMaxZoom={getMaxZoom}
      />

      {Object.keys(task.managementPlansByLocation).map((location_id) => {
        return (
          <div key={location_id}>
            <div style={{ paddingBottom: '16px' }}>
              <PageBreak label={task.locationsById[location_id].name} />
            </div>
            <PureCropTileContainer gap={gap} padding={padding}>
              {task.managementPlansByLocation[location_id]?.map((managementPlan) => {
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

      {Object.keys(task.managementPlansByPinCoordinate).map((pin_coordinate) => {
        const managementPlan = task.managementPlansByPinCoordinate[pin_coordinate];
        return (
          <div key={pin_coordinate}>
            <div style={{ paddingBottom: '16px' }}>
              <PageBreak label={pin_coordinate} />
            </div>
            <PureCropTileContainer gap={gap} padding={padding}>
              <PureManagementPlanTile
                managementPlan={managementPlan}
                date={managementPlan.firstTaskDate}
                status={managementPlan.status}
              />
            </PureCropTileContainer>
          </div>
        );
      })}

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
            !taskType.farm_id &&
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

      {isAbandoned && (
        <div>
          <Semibold style={{ marginBottom: '24px' }}>{t('TASK.ABANDONMENT_DETAILS')}</Semibold>

          <ReactSelect
            label={t('TASK.ABANDON.REASON_FOR_ABANDONMENT')}
            required={true}
            style={{ marginBottom: '24px' }}
            isDisabled={true}
            value={{
              label: t(`TASK.ABANDON.REASON.${task.abandonment_reason}`),
              value: task.abandonment_reason,
            }}
          />

          {task.duration > 0 && (
            <TimeSlider
              style={{ marginBottom: '40px' }}
              label={t('TASK.DURATION')}
              initialTime={task.duration}
              setValue={() => {}}
              disabled={true}
            />
          )}

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
            label={t('TASK.ABANDON.NOTES')}
            value={task.abandonment_notes}
            optional
            disabled
          />
        </div>
      )}

      <Semibold style={{ marginTop: '8px', marginBottom: '18px' }}>
        {t(`task:${taskType.task_translation_key}`) + ' ' + t('TASK.DETAILS')}
      </Semibold>

      {taskComponents[taskType.task_translation_key] !== undefined &&
        !taskType.farm_id &&
        taskComponents[taskType.task_translation_key]({
          setValue,
          getValues,
          watch,
          control,
          register,
          formState: { errors, isValid },
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

      {(self === task.assignee_user_id || self === owner || isAdmin) && isCurrent && (
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
