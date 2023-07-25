import PureManagementPlanDetail from '../../../components/Crop/ManagementDetail/ManagementPlanDetail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { managementPlanSelector } from '../../managementPlanSlice';
import { isAdminSelector, measurementSelector } from '../../userFarmSlice';
import { useSelector } from 'react-redux';
import FirstManagementPlanSpotlight from './FirstManagementPlanSpotlight';

export default function ManagementDetails({ history, match }) {
  const variety_id = match.params.variety_id;
  const variety = useSelector(cropVarietySelector(variety_id));

  const management_plan_id = match.params.management_plan_id;
  const plan = useSelector(managementPlanSelector(management_plan_id));

  if (plan === undefined) {
    history.replace('/unknown_record');
  }

  const isAdmin = useSelector(isAdminSelector);

  const onBack = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  const showSpotlight = history.location.state?.fromCreation;

  const system = useSelector(measurementSelector);

  return (
    <>
      <PureManagementPlanDetail
        onBack={onBack}
        isAdmin={isAdmin}
        variety={variety}
        plan={plan}
        history={history}
        match={match}
        system={system}
      />
      {showSpotlight && <FirstManagementPlanSpotlight />}
    </>
  );
}
