/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import Layout from '../../Layout';
import Button from '../../Form/Button';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../PageTitle/v2';
import Input from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import { Label, Main, Semibold, IconLink } from '../../Typography';
import styles from './styles.module.scss';
import PureManagementPlanTile from '../../CropTile/ManagementPlanTile';
import PureCropTileContainer from '../../CropTile/CropTileContainer';
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
import { BiPencil } from 'react-icons/bi';
import { ReactComponent as TrashIcon } from '../../../assets/images/document/trash.svg';
import TaskQuickAssignModal from '../../Modals/QuickAssignModal';
import { getDateInputFormat } from '../../../util/moment';
import UpdateTaskDateModal from '../../Modals/UpdateTaskDateModal';
import PureIrrigationTask from '../PureIrrigationTask';
import ConfirmDelete from './ConfirmDelete';

export default function PureTaskReadOnly({
  onGoBack,
  onComplete,
  onEdit,
  onAbandon,
  onDelete,
  task,
  users,
  user,
  isAdmin,
  system,
  products,
  harvestUseTypes,
  maxZoomRef,
  getMaxZoom,
  onAssignTasksOnDate,
  onAssignTask,
  onChangeTaskDate,
  onUpdateUserFarmWage,
  onChangeTaskWage,
  onSetUserFarmWageDoNotAskAgain,
  wage_at_moment,
}) {
  const { t } = useTranslation();
  const taskType = task.taskType;
  const { date, dateLabel, secondDate, secondDateLabel } = useMemo(() => {
    if (task.abandon_date) {
      return {
        date: getDateInputFormat(task.abandon_date),
        dateLabel: t('TASK.ABANDON.DATE'),
        secondDate: getDateInputFormat(task.due_date),
        secondDateLabel: t('TASK.DUE_DATE'),
      };
    } else if (task.complete_date) {
      return {
        date: getDateInputFormat(task.complete_date),
        dateLabel: t('TASK.COMPLETE.DATE'),
        secondDate: getDateInputFormat(task.due_date),
        secondDateLabel: t('TASK.DUE_DATE'),
      };
    } else {
      return {
        date: getDateInputFormat(task.due_date),
        dateLabel: t('TASK.DUE_DATE'),
        secondDate: null,
        secondDateLabel: null,
      };
    }
  }, [task]);
  const locationIds = task.locations.map(({ location_id }) => location_id);
  const owner_user_id = task.owner_user_id;
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
    defaultValues: cloneObject(task),
  });

  const taskAfterCompleteComponents = {
    HARVEST_TASK: (props) => (
      <PureHavestTaskCompleted system={system} {...props} harvestUseTypes={harvestUseTypes} />
    ),
  };

  const assignee = users.find((user) => user.user_id === task.assignee_user_id);
  const assigneeName = assignee && `${assignee.first_name} ${assignee.last_name}`;
  const assignedToPseudoUser = assignee && assignee.role_id === 4;

  const isCompleted = !!task.complete_date;
  const isAbandoned = !!task.abandon_date;
  const isOtherReason = task.abandonment_reason === 'OTHER';
  const isCurrent = !isCompleted && !isAbandoned;
  const taskStatus = getTaskStatus(task);

  const showTaskNotes =
    !isTaskType(taskType, 'PLANT_TASK') && !isTaskType(taskType, 'TRANSPLANT_TASK');

  const [showTaskAssignModal, setShowTaskAssignModal] = useState(false);
  const [showDueDateModal, setShowDueDateModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCompleteTask =
    user.user_id === task.assignee_user_id || (assignedToPseudoUser && user.is_admin);

  const preDelete = () => {
    setIsDeleting(true);
  };

  return (
    <Layout
      buttonGroup={
        canCompleteTask &&
        isCurrent && (
          <>
            {(user.user_id === task.assignee_user_id ||
              user.user_id === owner_user_id ||
              isAdmin) &&
              isCurrent && (
                <Button
                  data-cy="taskReadOnly-abandon"
                  color={'secondary'}
                  onClick={onAbandon}
                  fullLength
                >
                  {t('TASK.ABANDON.ABANDON')}
                </Button>
              )}
            <Button
              data-cy="taskReadOnly-complete"
              color={'primary'}
              onClick={onComplete}
              fullLength
            >
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
          <StatusLabel
            label={t(`TASK.STATUS.${taskStatusTranslateKey[taskStatus]}`)}
            color={taskStatus}
          />
        }
      />
      <div className={styles.editableContainer}>
        <Input
          label={t('ADD_TASK.ASSIGNEE')}
          disabled={true}
          value={assigneeName ? assigneeName : t('TASK.UNASSIGNED')}
        />
        {isCurrent && (
          <BiPencil
            data-cy="taskReadOnly-pencil"
            className={styles.pencil}
            onClick={(_) => setShowTaskAssignModal(true)}
          />
        )}
      </div>

      <div className={styles.editableContainer}>
        <Input type={'date'} value={date} label={dateLabel} disabled />
        {isCurrent && isAdmin && (
          <BiPencil className={styles.pencil} onClick={(_) => setShowDueDateModal(true)} />
        )}
      </div>

      {secondDate && (
        <div className={styles.editableContainer}>
          <Input type={'date'} value={secondDate} label={secondDateLabel} disabled />
        </div>
      )}

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
            <PureCropTileContainer gap={24}>
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
            <PureCropTileContainer gap={24}>
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
              reset,
              getFieldState,
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
          {isOtherReason && (
            <InputAutoSize
              style={{ marginTop: '40px', marginBottom: '40px' }}
              label={t('TASK.ABANDON.EXPLANATION')}
              value={task.other_abandonment_reason}
              disabled
            />
          )}

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
          reset,
          getFieldState,
          formState: { errors, isValid },
          errors,
          disabled: true,
          farm: user,
          system,
          products,
          task,
        })}
      {showTaskNotes && (
        <InputAutoSize
          style={{ marginBottom: '40px' }}
          label={t('common:NOTES')}
          value={task.notes}
          optional
          disabled
        />
      )}

      {(user.user_id === task.assignee_user_id || user.user_id === owner_user_id || isAdmin) &&
        isCurrent &&
        !isDeleting && (
          <IconLink
            className={styles.deleteText}
            style={{ color: 'var(--grey600)' }}
            icon={
              <TrashIcon
                style={{
                  fill: 'var(--grey600)',
                  stroke: 'var(--grey600)',
                  transform: 'translate(0px, 6px)',
                }}
              />
            }
            onClick={preDelete}
          >
            {t('TASK.DELETE.DELETE_TASK')}
          </IconLink>
        )}
      {showTaskAssignModal && (
        <TaskQuickAssignModal
          task_id={task.task_id}
          due_date={task.complete_date || task.due_date}
          isAssigned={!!task?.assignee}
          onAssignTasksOnDate={onAssignTasksOnDate}
          onAssignTask={onAssignTask}
          onUpdateUserFarmWage={onUpdateUserFarmWage}
          onChangeTaskWage={onChangeTaskWage}
          onSetUserFarmWageDoNotAskAgain={onSetUserFarmWageDoNotAskAgain}
          users={users}
          user={user}
          dismissModal={() => setShowTaskAssignModal(false)}
          wage_at_moment={wage_at_moment}
        />
      )}
      {showDueDateModal && (
        <UpdateTaskDateModal
          due_date={date}
          onChangeTaskDate={onChangeTaskDate}
          dismissModal={() => setShowDueDateModal(false)}
        />
      )}
      {isDeleting && <ConfirmDelete onDelete={onDelete} onCancel={() => setIsDeleting(false)} />}
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
  IRRIGATION_TASK: (props) => <PureIrrigationTask {...props} />,
};
