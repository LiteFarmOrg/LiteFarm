import { useDispatch, useSelector } from 'react-redux';
import PureManagementPlanName from '../../../../components/Crop/ManagementPlanName';
import { managementPlansByCropVarietyIdSelector } from '../../../managementPlanSlice';
import { patchFarmDefaultInitialLocation, postManagementPlan } from '../../saga';
import { getProcessedFormData } from '../../../hooks/useHookFormPersist/utils';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { getDefaultLocationReqBody } from './getManagementPlanReqBody';

export default function ManagementPlanName({ history, match }) {
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    const { management_plan, farm } = formatManagementPlanFormData(data);
    dispatch(
      postManagementPlan({
        ...management_plan,
        crop_variety_id: match.params.variety_id,
        assignee_user_id: data.assignee.value,
      }),
    );
    farm && dispatch(patchFarmDefaultInitialLocation(farm));
  };
  const onError = () => {};
  const managementPlans = useSelector(
    managementPlansByCropVarietyIdSelector(match?.params?.variety_id),
  );

  return (
    <HookFormPersistProvider>
      <PureManagementPlanName
        onSubmit={onSubmit}
        onError={onError}
        match={match}
        history={history}
        managementPlanCount={managementPlans.length + 1}
      />
    </HookFormPersistProvider>
  );
}

const formatManagementPlanFormData = (formData) => {
  const data = getProcessedFormData(formData);
  return getDefaultLocationReqBody(data);
};
