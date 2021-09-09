import PurePlanGuidance from '../../../components/Crop/BedPlan/BedPlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { managementPlanSelector } from '../../managementPlanSlice';

export default function TaskBedGuidance({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { variety_id } = useSelector(
    managementPlanSelector(persistedFormData.managementPlans[0].management_plan_id),
  );
  const system = useSelector(measurementSelector);
  return (
    <HookFormPersistProvider>
      <PurePlanGuidance
        system={system}
        history={history}
        isBed={true}
        variety_id={variety_id}
        isFinalPage={true}
        goBackPath={'/add_task/bed_method'}
        cancelPath={'/tasks'}
        submitPath={'/add_task/task_assignment'}
      />
    </HookFormPersistProvider>
  );
}
