import PureManagementPlanDetail from '../../../components/Crop/ManagementDetail/ManagementPlanDetail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { managementPlanSelector } from '../../managementPlanSlice';
import { isAdminSelector, measurementSelector } from '../../userFarmSlice';
import { useSelector } from 'react-redux';
import FirstManagementPlanSpotlight from './FirstManagementPlanSpotlight';
import { useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getManagementPlansAndTasks } from '../../saga';

export default function ManagementDetails() {
  const history = useHistory();
  const match = useRouteMatch();
  const variety_id = match.params.variety_id;
  const variety = useSelector(cropVarietySelector(variety_id));

  const management_plan_id = match.params.management_plan_id;
  const plan = useSelector(managementPlanSelector(management_plan_id));

  useEffect(() => {
    if (!plan || plan.deleted) {
      history.replace(`/crop/${variety_id}/management_plan/${management_plan_id}/tasks`);
    }
  }, [plan, history]);

  const isAdmin = useSelector(isAdminSelector);

  const onBack = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getManagementPlansAndTasks());
  }, []);

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
