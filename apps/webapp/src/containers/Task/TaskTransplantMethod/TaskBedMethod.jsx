import PureBedPlan from '../../../components/Crop/BedPlan/PureBedPlan';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { cropVarietySelector } from '../../cropVarietySlice';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { managementPlanSelector } from '../../managementPlanSlice';

export default function TaskBedPlan({ history, match, location }) {
  const system = useSelector(measurementSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { crop_variety_id } = useSelector(
    managementPlanSelector(persistedFormData.managementPlans[0].management_plan_id),
  );
  const crop_variety = useSelector(cropVarietySelector(crop_variety_id));

  return (
    <HookFormPersistProvider>
      <PureBedPlan
        match={match}
        history={history}
        system={system}
        crop_variety={crop_variety}
        isFinalPage={true}
        submitPath={'/add_task/bed_guidance'}
        prefix={'transplant_task.planting_management_plan'}
        location={location}
      />
    </HookFormPersistProvider>
  );
}
