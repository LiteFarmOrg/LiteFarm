import { useDispatch, useSelector } from 'react-redux';
import PureManagementPlanName from '../../../../components/Crop/ManagementPlanName';
import { managementPlansByCropVarietyIdSelector } from '../../../managementPlanSlice';
import { patchFarmDefaultInitialLocation, postManagementPlan } from '../../saga';
import { getProcessedFormData } from '../../../hooks/useHookFormPersist/utils';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { getDefaultLocationReqBody } from './getManagementPlanReqBody';
import { useParams } from 'react-router-dom-v5-compat';

export default function ManagementPlanName() {
  let { variety_id } = useParams();
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    const { management_plan, farm } = formatManagementPlanFormData(data);
    dispatch(
      postManagementPlan({
        ...management_plan,
        crop_variety_id: variety_id,
        assignee_user_id: data.assignee.value,
        repeat_crop_plan: data.repeat_crop_plan || false,
      }),
    );
    farm && dispatch(patchFarmDefaultInitialLocation(farm));
  };
  const onError = () => {};
  const managementPlans = useSelector(managementPlansByCropVarietyIdSelector(variety_id));

  return (
    <HookFormPersistProvider>
      <PureManagementPlanName
        onSubmit={onSubmit}
        onError={onError}
        managementPlanCount={managementPlans.length + 1}
      />
    </HookFormPersistProvider>
  );
}

const formatManagementPlanFormData = (formData) => {
  const data = getProcessedFormData(formData);
  return getDefaultLocationReqBody(data);
};
