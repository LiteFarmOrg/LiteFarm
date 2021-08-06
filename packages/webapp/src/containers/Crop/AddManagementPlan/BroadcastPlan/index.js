import React from 'react';
import PureBroadcastPlan from '../../../../components/Crop/BroadcastPlan';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { measurementSelector } from '../../../userFarmSlice';
import { cropLocationByIdSelector } from '../../../locationSlice';
import { cropVarietyByID } from '../../../cropVarietySlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

function BroadcastPlan({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const location = useSelector(cropLocationByIdSelector(persistedFormData.location_id));
  const variety_id = match.params.variety_id;
  const cropVariety = useSelector(cropVarietyByID(variety_id));
  const yieldPerArea = cropVariety.yield_per_area || 0;
  const system = useSelector(measurementSelector);
  const isFinalPage = match?.path.includes('final');

  return (
    <HookFormPersistProvider>
      <PureBroadcastPlan
        system={system}
        variety_id={variety_id}
        history={history}
        isFinalPage={isFinalPage}
        locationSize={location.total_area}
        yieldPerArea={yieldPerArea}
      />
    </HookFormPersistProvider>
  );
}

export default BroadcastPlan;
