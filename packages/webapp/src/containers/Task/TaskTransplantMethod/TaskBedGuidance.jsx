import PurePlanGuidance from '../../../components/Crop/BedPlan/PurePlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { managementPlanSelector } from '../../managementPlanSlice';

export default function TaskBedGuidance({ history, location }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { crop_variety_id } = useSelector(
    managementPlanSelector(persistedFormData.managementPlans[0].management_plan_id),
  );
  const system = useSelector(measurementSelector);

  return (
    <HookFormPersistProvider>
      <PurePlanGuidance
        system={system}
        history={history}
        isBed={true}
        variety_id={crop_variety_id}
        isFinalPage={true}
        submitPath={'/add_task/task_assignment'}
        prefix={'transplant_task.planting_management_plan'}
        location={location}
      />
    </HookFormPersistProvider>
  );
}
