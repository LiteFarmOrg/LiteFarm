import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureRowMethod from '../../../components/Crop/RowMethod';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { cropVarietySelector } from '../../cropVarietySlice';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { managementPlanSelector } from '../../managementPlanSlice';

export default function TaskRowMethod({ history, match }) {
  const system = useSelector(measurementSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { variety_id } = useSelector(
    managementPlanSelector(persistedFormData.managementPlans[0].management_plan_id),
  );
  const crop_variety = useSelector(cropVarietySelector(variety_id));
  return (
    <HookFormPersistProvider>
      <PureRowMethod
        system={system}
        variety={crop_variety}
        isFinalPage={true}
        history={history}
        goBackPath={'/add_task/planting_method'}
        submitPath={'/add_task/row_guidance'}
        cancelPath={'/tasks'}
      />
    </HookFormPersistProvider>
  );
}
