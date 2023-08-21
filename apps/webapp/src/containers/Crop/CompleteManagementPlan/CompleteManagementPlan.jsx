import { PureCompleteManagementPlan } from '../../../components/Crop/CompleteManamgenentPlan/PureCompleteManagementPlan';
import { useDispatch, useSelector } from 'react-redux';
import { cropVarietySelector } from '../../cropVarietySlice';
import { completeManagementPlan } from './saga';
import {
  managementPlanSelector,
  managementPlanByManagementPlanIDSelector,
} from '../../managementPlanSlice';

export default function CompleteManagementPlan({ match, history, location }) {
  const management_plan_id = match.params.management_plan_id;
  const crop_variety_id = match.params.variety_id;
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
    history.push(
      `/crop/${crop_variety_id}/management_plan/${management_plan_id}/tasks`,
      location?.state,
    );
  };
  const onSubmit = (data) => {
    dispatch(completeManagementPlan({ crop_variety_id, management_plan_id, ...data }));
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
