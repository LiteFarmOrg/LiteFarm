import { useDispatch, useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import PureManagementPlanName from '../../../../components/Crop/ManagementPlanName';
import { managementPlansByCropVarietyIdSelector } from '../../../managementPlanSlice';
import { broadcastMethodProperties } from '../../../broadcastMethodSlice';
import { containerMethodProperties } from '../../../containerMethodSlice';
import { bedMethodProperties } from '../../../bedMethodSlice';
import { rowProperties } from '../../../rowMethodSlice';
import { postManagementPlan } from './saga';
import { getProcessedFormData } from '../../../hooks/useHookFormPersist/utils';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

export default function ManagementPlanName({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    dispatch(
      postManagementPlan(
        formatManagementPlanFormData({
          ...persistedFormData,
          ...data,
          crop_variety_id: match.params.variety_id,
        }),
      ),
    );
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

  data.crop_management_plan.planting_management_plans = Object.keys(
    data.crop_management_plan.planting_management_plans,
  ).map((key) => ({
    ...data.crop_management_plan.planting_management_plans[key],
    is_final_planting_management_plan: key === 'final',
  }));
  console.log(data);
  return data;
};

const plantingTypePropertiesMap = {
  BROADCAST_METHOD: broadcastMethodProperties,
  CONTAINER_METHOD: containerMethodProperties,
  BED_METHOD: bedMethodProperties,
  ROW_METHOD: rowProperties,
};
