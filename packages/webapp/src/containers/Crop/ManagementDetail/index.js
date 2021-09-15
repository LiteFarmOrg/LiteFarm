import PureManagementDetail from '../../../components/Crop/ManagementDetail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { managementPlanSelector } from '../../managementPlanSlice';
import { isAdminSelector } from '../../userFarmSlice';
import { useSelector } from 'react-redux';
import FirstManagementPlanSpotlight from './FirstManagementPlanSpotlight';
import {
  tasksByManagementPlanIdSelector,
  pendingTasksByManagementPlanIdSelector,
} from '../../taskSlice';

export default function ManagementDetail({ history, match }) {
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

  const handleAddTask = () => {
    // TODO: add management plan and location to formData
    history.push(`/add_task/task_type_selection`);
  };

  const showSpotlight = history.location.state?.fromCreation;

  const allTasks = useSelector(tasksByManagementPlanIdSelector(management_plan_id));
  const pendingTasks = useSelector(pendingTasksByManagementPlanIdSelector(management_plan_id));
  return (
    <>
      <PureManagementDetail
        onBack={onBack}
        onCompleted={onCompleted}
        onAbandon={onAbandon}
        onAddTask={handleAddTask}
        isAdmin={isAdmin}
        variety={variety}
        plan={plan}
        tasks={allTasks}
        hasPendingTasks={!!pendingTasks?.length}
        history={history}
      />
      {showSpotlight && <FirstManagementPlanSpotlight />}
    </>
  );
}
