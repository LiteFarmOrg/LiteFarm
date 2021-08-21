import { PureCompleteManagementPlan } from '../../../components/Crop/CompleteManamgenentPlan/PureCompleteManagementPlan';
import { useDispatch, useSelector } from 'react-redux';
import { cropVarietySelector } from '../../cropVarietySlice';
import { completeManagementPlan } from './saga';
import { managementPlanSelector } from '../../managementPlanSlice';

export default function CompleteManagementPlan({ match, history }) {
  const management_plan_id = match.params.management_plan_id;
  const crop_variety_id = match.params.variety_id;
  const crop_variety = useSelector(cropVarietySelector(crop_variety_id));
  const { start_date } = useSelector(managementPlanSelector(management_plan_id));
  const dispatch = useDispatch();

  const onGoBack = () => {
    history.push(`/crop/${crop_variety_id}/${management_plan_id}/management_detail`);
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
    />
  );
}
