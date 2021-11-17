import PurePlantInContainer from '../../../components/Crop/PlantInContainer';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { cropVarietySelector } from '../../cropVarietySlice';
import { hookFormPersistSelector, hookFormPersistEntryPathSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { managementPlanSelector } from '../../managementPlanSlice';

export default function TaskPlantInContainer({ history, match }) {
  const system = useSelector(measurementSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { crop_variety_id } = useSelector(
    managementPlanSelector(persistedFormData.managementPlans[0].management_plan_id),
  );
  const crop_variety = useSelector(cropVarietySelector(crop_variety_id));
  const entryPath = useSelector(hookFormPersistEntryPathSelector);

  return (
    <HookFormPersistProvider>
      <PurePlantInContainer
        match={match}
        history={history}
        system={system}
        crop_variety={crop_variety}
        isFinalPage={true}
        cancelPath={entryPath}
        submitPath={'/add_task/task_assignment'}
        prefix={'transplant_task.planting_management_plan'}
      />
    </HookFormPersistProvider>
  );
}
