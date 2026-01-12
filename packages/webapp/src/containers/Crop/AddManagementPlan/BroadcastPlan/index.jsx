import { useLocation, useMatch, useParams } from 'react-router-dom';
import PureBroadcastPlan from '../../../../components/Crop/BroadcastPlan';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { measurementSelector } from '../../../userFarmSlice';
import { cropLocationByIdSelector } from '../../../locationSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

function BroadcastPlan() {
  const location = useLocation();
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { variety_id } = useParams();
  const cropVariety = useSelector(cropVarietySelector(variety_id));
  const yieldPerArea = cropVariety.yield_per_area || 0;
  const system = useSelector(measurementSelector);
  const isFinalPage = useMatch('/crop/:variety_id/add_management_plan/broadcast_method');
  const planLocation = useSelector(
    cropLocationByIdSelector(
      persistedFormData.crop_management_plan.planting_management_plans[
        isFinalPage ? 'final' : 'initial'
      ].location_id,
    ),
  );

  return (
    <HookFormPersistProvider>
      <PureBroadcastPlan
        system={system}
        variety_id={variety_id}
        isFinalPage={isFinalPage}
        locationSize={planLocation.total_area}
        yieldPerArea={yieldPerArea}
        location={location}
      />
    </HookFormPersistProvider>
  );
}

export default BroadcastPlan;
