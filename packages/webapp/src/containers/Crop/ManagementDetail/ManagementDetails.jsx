import PureManagementPlanDetail from '../../../components/Crop/ManagementDetail/ManagementPlanDetail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { managementPlanSelector } from '../../managementPlanSlice';
import { isAdminSelector, measurementSelector } from '../../userFarmSlice';
import { useSelector } from 'react-redux';
import FirstManagementPlanSpotlight from './FirstManagementPlanSpotlight';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getManagementPlansAndTasks } from '../../saga';
import { useLocation, useNavigate, useParams } from 'react-router';

export default function ManagementDetails() {
  let navigate = useNavigate();
  let location = useLocation();
  let { variety_id, management_plan_id } = useParams();
  const variety = useSelector(cropVarietySelector(variety_id));
  const plan = useSelector(managementPlanSelector(management_plan_id));

  useEffect(() => {
    if (!plan || plan.deleted) {
      navigate(`/crop/${variety_id}/management_plan/${management_plan_id}/tasks`, {
        replace: true,
      });
    }
  }, [plan, navigate]);

  const isAdmin = useSelector(isAdminSelector);

  const onBack = () => {
    navigate(`/crop/${variety_id}/management`);
  };

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getManagementPlansAndTasks());
  }, []);

  const showSpotlight = location.state?.fromCreation;

  const system = useSelector(measurementSelector);

  return (
    <>
      <PureManagementPlanDetail
        onBack={onBack}
        isAdmin={isAdmin}
        variety={variety}
        plan={plan}
        system={system}
      />
      {showSpotlight && <FirstManagementPlanSpotlight />}
    </>
  );
}
