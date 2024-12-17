import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  PureCompleteManagementPlan,
  SOMETHING_ELSE,
} from '../../../components/Crop/CompleteManamgenentPlan/PureCompleteManagementPlan';
import { cropVarietySelector } from '../../cropVarietySlice';
import {
  managementPlanByManagementPlanIDSelector,
  managementPlanSelector,
} from '../../managementPlanSlice';
import { abandonManagementPlan } from './saga';
import { useAbandonReasonOptions } from './useAbandonReasonOptions';

export default function AbandonManagementPlan({ history, location }) {
  let { management_plan_id, variety_id: crop_variety_id } = useParams();
  const crop_variety = useSelector(cropVarietySelector(crop_variety_id));
  const { start_date } = useSelector(managementPlanSelector(management_plan_id));
  const dispatch = useDispatch();
  const reasonOptions = useAbandonReasonOptions();
  const [management_plan] = useSelector(
    managementPlanByManagementPlanIDSelector(management_plan_id),
  );

  const status = management_plan?.complete_date
    ? 'completed'
    : management_plan?.abandon_date
      ? 'abandoned'
      : '';

  const onGoBack = () => {
    history.push(`/crop/${crop_variety_id}/management`, location?.state);
  };
  const onSubmit = (data, displayCannotAbandonModal) => {
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

    dispatch(abandonManagementPlan({ displayCannotAbandonModal, ...reqBody }));
  };
  return (
    <PureCompleteManagementPlan
      reasonOptions={reasonOptions}
      isAbandonPage={true}
      crop_variety={crop_variety}
      onGoBack={onGoBack}
      onSubmit={onSubmit}
      start_date={start_date}
      status={status}
    />
  );
}
