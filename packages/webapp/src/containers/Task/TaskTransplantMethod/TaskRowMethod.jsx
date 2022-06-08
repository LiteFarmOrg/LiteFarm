import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureRowMethod from '../../../components/Crop/RowMethod';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { cropVarietySelector } from '../../cropVarietySlice';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { managementPlanSelector } from '../../managementPlanSlice';

export default function TaskRowMethod({ history, match, location }) {
  const system = useSelector(measurementSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { crop_variety_id } = useSelector(
    managementPlanSelector(persistedFormData.managementPlans[0].management_plan_id),
  );
  const crop_variety = useSelector(cropVarietySelector(crop_variety_id));

  return (
    <HookFormPersistProvider>
      <PureRowMethod
        system={system}
        crop_variety={crop_variety}
        isFinalPage={true}
        history={history}
        submitPath={'/add_task/row_guidance'}
        prefix={'transplant_task.planting_management_plan'}
        location={location}
      />
    </HookFormPersistProvider>
  );
}
