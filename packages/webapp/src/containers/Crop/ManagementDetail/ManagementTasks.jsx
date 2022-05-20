import PureManagementTasks from '../../../components/Crop/ManagementDetail/ManagementPlanTasks';
import { cropVarietySelector } from '../../cropVarietySlice';
import { managementPlanSelector } from '../../managementPlanSlice';
import { isAdminSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import FirstManagementPlanSpotlight from './FirstManagementPlanSpotlight';
import { pendingTasksByManagementPlanIdSelector } from '../../taskSlice';
import TaskCard from '../../Task/TaskCard';
import React from 'react';
import { taskCardContentByManagementPlanSelector } from '../../Task/taskCardContentSelector';
import { onAddTask } from '../../Task/onAddTask';

export default function ManagementTasks({ history, match }) {
  const dispatch = useDispatch();
  const variety_id = match.params.variety_id;
  const variety = useSelector(cropVarietySelector(variety_id));

  const management_plan_id = match.params.management_plan_id;
  const plan = useSelector(managementPlanSelector(management_plan_id));
  const isAdmin = useSelector(isAdminSelector);

  const onBack = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  const onCompleted = () => {
    history.push(`/crop/${variety_id}/${management_plan_id}/complete_management_plan`);
  };
  const onAbandon = () =>
    history.push(`/crop/${variety_id}/${management_plan_id}/abandon_management_plan`);

  const showSpotlight = history.location.state?.fromCreation;

  const pendingTasks = useSelector(pendingTasksByManagementPlanIdSelector(management_plan_id));
  const taskCardContents = useSelector(taskCardContentByManagementPlanSelector(management_plan_id));
  return (
    <>
      <PureManagementTasks
        onBack={onBack}
        onCompleted={onCompleted}
        onAbandon={onAbandon}
        onAddTask={onAddTask(
          dispatch,
          history,
          `/crop/${variety_id}/management_plan/${management_plan_id}/tasks`,
        )}
        isAdmin={isAdmin}
        variety={variety}
        plan={plan}
        hasPendingTasks={!!pendingTasks?.length}
        history={history}
        match={match}
      >
        {taskCardContents.map((task) => (
          <TaskCard
            key={task.task_id}
            onClick={() => history.push(`/tasks/${task.task_id}/read_only`)}
            style={{ marginBottom: '14px' }}
            {...task}
          />
        ))}
      </PureManagementTasks>
      {showSpotlight && <FirstManagementPlanSpotlight />}
    </>
  );
}
