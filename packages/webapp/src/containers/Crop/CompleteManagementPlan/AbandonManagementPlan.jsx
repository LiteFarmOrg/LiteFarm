import {
  PureCompleteManagementPlan,
  SOMETHING_ELSE,
} from '../../../components/Crop/CompleteManamgenentPlan/PureCompleteManagementPlan';
import { useDispatch, useSelector } from 'react-redux';
import { cropVarietySelector } from '../../cropVarietySlice';
import { abandonManagementPlan } from './saga';
import { useAbandonReasonOptions } from './useAbandonReasonOptions';
import { managementPlanSelector } from '../../managementPlanSlice';

export default function AbandonManagementPlan({ match, history, location }) {
  const management_plan_id = match.params.management_plan_id;
  const crop_variety_id = match.params.variety_id;
  const crop_variety = useSelector(cropVarietySelector(crop_variety_id));
  const { start_date } = useSelector(managementPlanSelector(management_plan_id));
  const dispatch = useDispatch();
  const reasonOptions = useAbandonReasonOptions();

  const onGoBack = () => {
    history.push(`/crop/${crop_variety_id}/management`, location?.state);
  };
  const onSubmit = (data) => {
    const reqBody = {
      crop_variety_id,
      management_plan_id,
      ...data,
      created_abandon_reason: undefined,
      abandon_reason:
        data.abandon_reason.value === SOMETHING_ELSE
          ? data.created_abandon_reason || SOMETHING_ELSE
          : data.abandon_reason.value,
    };

    dispatch(abandonManagementPlan(reqBody));
  };
  return (
    <PureCompleteManagementPlan
      reasonOptions={reasonOptions}
      isAbandonPage={true}
      crop_variety={crop_variety}
      onGoBack={onGoBack}
      onSubmit={onSubmit}
      start_date={start_date}
    />
  );
}
