import { PureCompleteManagementPlan } from '../../../components/Crop/CompleteManamgenentPlan/PureCompleteManagementPlan';
import { useDispatch, useSelector } from 'react-redux';
import { cropVarietySelector } from '../../cropVarietySlice';
import { abandonManagementPlan } from './saga';
import { useAbandonReasonOptions } from './useAbandonReasonOptions';

export default function AbandonManagementPlan({ match, history }) {
  const management_plan_id = match.params.management_plan_id;
  const crop_variety_id = match.params.variety_id;
  const crop_variety = useSelector(cropVarietySelector(crop_variety_id));
  const dispatch = useDispatch();
  const reasonOptions = useAbandonReasonOptions();

  const onGoBack = () => {
    history.push(`/crop/${crop_variety_id}/${management_plan_id}/management_detail`);
  };
  const onSubmit = (data) => {
    dispatch(abandonManagementPlan({ crop_variety_id, management_plan_id, ...data }));
  };
  return (
    <PureCompleteManagementPlan
      reasonOptions={reasonOptions}
      isAbandonPage={true}
      crop_variety={crop_variety}
      onGoBack={onGoBack}
      onSubmit={onSubmit}
    />
  );
}
