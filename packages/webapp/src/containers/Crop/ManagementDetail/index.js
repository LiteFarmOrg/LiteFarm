import PureManagementDetail from '../../../components/Crop/ManagementDetail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { managementPlanSelectorById } from '../../managementPlanSlice';
import { isAdminSelector } from '../../userFarmSlice';
import { useSelector } from 'react-redux';
import FirstManagementPlanSpotlight from './FirstManagementPlanSpotlight';
import { pendingTasksByManagementPlanIdSelector } from '../../taskSlice';

export default function ManagementDetail({ history, match }) {
  const variety_id = match.params.variety_id;
  const variety = useSelector(cropVarietySelector(variety_id));

  const plan_id = match.params.management_plan_id;
  const plan = useSelector(managementPlanSelectorById(plan_id));

  const isAdmin = useSelector(isAdminSelector);

  const onBack = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  const onCompleted = () => {
    console.log('Go to LF-1645');
  };

  const showSpotlight = history.location.state?.fromCreation;

  const { management_plan_id } = match.params;
  const pendingTasks = useSelector(pendingTasksByManagementPlanIdSelector(management_plan_id));

  return (
    <>
      <PureManagementDetail
        onBack={onBack}
        onCompleted={onCompleted}
        isAdmin={isAdmin}
        variety={variety}
        plan={plan}
      />
      {showSpotlight && <FirstManagementPlanSpotlight />}
    </>
  );
}
