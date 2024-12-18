import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';
import { PureCompleteManagementPlan } from '../../../components/Crop/CompleteManamgenentPlan/PureCompleteManagementPlan';
import { cropVarietySelector } from '../../cropVarietySlice';
import {
  managementPlanByManagementPlanIDSelector,
  managementPlanSelector,
} from '../../managementPlanSlice';
import { completeManagementPlan } from './saga';

export default function CompleteManagementPlan() {
  let navigate = useNavigate();
  let location = useLocation();
  let { management_plan_id, variety_id: crop_variety_id } = useParams();
  const crop_variety = useSelector(cropVarietySelector(crop_variety_id));
  const [management_plan] = useSelector(
    managementPlanByManagementPlanIDSelector(management_plan_id),
  );
  const status = management_plan?.complete_date
    ? 'completed'
    : management_plan?.abandon_date
      ? 'abandoned'
      : '';
  const { start_date } = useSelector(managementPlanSelector(management_plan_id));
  const dispatch = useDispatch();

  const onGoBack = () => {
    navigate(`/crop/${crop_variety_id}/management_plan/${management_plan_id}/tasks`, {
      state: location?.state,
    });
  };
  const onSubmit = (data, displayCannotCompleteModal) => {
    dispatch(
      completeManagementPlan({
        displayCannotCompleteModal,
        crop_variety_id,
        management_plan_id,
        ...data,
      }),
    );
  };
  return (
    <PureCompleteManagementPlan
      isAbandonPage={false}
      crop_variety={crop_variety}
      onGoBack={onGoBack}
      onSubmit={onSubmit}
      start_date={start_date}
      status={status}
    />
  );
}
