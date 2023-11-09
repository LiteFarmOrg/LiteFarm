import PureManagementTasks from '../../../components/Crop/ManagementDetail/ManagementPlanTasks';
import { cropVarietySelector } from '../../cropVarietySlice';
import { managementPlanSelector } from '../../managementPlanSlice';
import { isAdminSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import FirstManagementPlanSpotlight from './FirstManagementPlanSpotlight';
import { pendingTasksByManagementPlanIdSelector } from '../../taskSlice';
import TaskCard from '../../Task/TaskCard';
import { useEffect, useState } from 'react';
import { taskCardContentByManagementPlanSelector } from '../../Task/taskCardContentSelector';
import { onAddTask } from '../../Task/onAddTask';
import { getManagementPlansAndTasks } from '../../saga';
import { deleteManagementPlan } from '../saga';
import { checkManagementPlanDependencies } from '../saga';
import UnableToDeleteConcurrencyModal from '../../../components/Modals/UnableToDeleteConcurrencyModal';

export default function ManagementTasks({ history, match, location }) {
  const dispatch = useDispatch();
  const variety_id = match.params.variety_id;
  const variety = useSelector(cropVarietySelector(variety_id));

  const management_plan_id = match.params.management_plan_id;
  const plan = useSelector(managementPlanSelector(management_plan_id));

  const [showCannotDeleteModal, setShowCannotDeleteModal] = useState(false);

  useEffect(() => {
    if (!plan || plan.deleted) {
      history.replace('/unknown_record');
    }
  }, [plan, history]);

  const isAdmin = useSelector(isAdminSelector);

  useEffect(() => {
    dispatch(getManagementPlansAndTasks());
  }, []);

  const onBack = () => {
    history.push(`/crop/${variety_id}/management`, location?.state);
  };

  const onCompleted = () => {
    history.push(
      `/crop/${variety_id}/${management_plan_id}/complete_management_plan`,
      location?.state,
    );
  };
  const onAbandon = () =>
    history.push(
      `/crop/${variety_id}/${management_plan_id}/abandon_management_plan`,
      location?.state,
    );

  const showSpotlight = history.location.state?.fromCreation;

  const pendingTasks = useSelector(pendingTasksByManagementPlanIdSelector(management_plan_id));
  const taskCardContents = useSelector(taskCardContentByManagementPlanSelector(management_plan_id));

  const onDelete = () => {
    dispatch(
      checkManagementPlanDependencies({
        management_plan_id,
        setShowCannotDeleteModal,
      }),
    );

    dispatch(deleteManagementPlan({ variety_id, management_plan_id }));
  };

  const eligibleForDeletion = !taskCardContents.some(
    (taskCard) => taskCard.status === 'completed' || taskCard.status === 'abandoned',
  );

  return (
    <>
      <PureManagementTasks
        onBack={onBack}
        onCompleted={onCompleted}
        onAbandon={onAbandon}
        onAddTask={onAddTask(dispatch, history, {
          pathname: `/crop/${variety_id}/management_plan/${management_plan_id}/tasks`,
          management_plan_id: management_plan_id,
        })}
        onDelete={onDelete}
        isAdmin={isAdmin}
        variety={variety}
        plan={plan}
        hasPendingTasks={!!pendingTasks?.length}
        history={history}
        match={match}
        location={location}
        eligibleForDeletion={eligibleForDeletion}
      >
        {taskCardContents.map((task) => (
          <TaskCard
            key={task.task_id}
            onClick={() =>
              history.push(`/tasks/${task.task_id}/read_only`, { pathname: location.pathname })
            }
            style={{ marginBottom: '14px' }}
            {...task}
          />
        ))}
      </PureManagementTasks>
      {showCannotDeleteModal && (
        <UnableToDeleteConcurrencyModal dismissModal={() => setShowCannotDeleteModal(false)} />
      )}
      {showSpotlight && <FirstManagementPlanSpotlight />}
    </>
  );
}
