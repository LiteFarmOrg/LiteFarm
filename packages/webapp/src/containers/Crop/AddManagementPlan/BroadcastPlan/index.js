import React from 'react';
import PureBroadcastPlan from '../../../../components/Crop/BroadcastPlan';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { measurementSelector } from '../../../userFarmSlice';
import { cropLocationByIdSelector } from '../../../locationSlice';
import { cropVarietyByID } from '../../../cropVarietySlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import {
  addManagementPlanNamePath,
  finalPlantingMethodPath,
} from '../../../../components/Crop/addManagementPlanPaths';

function BroadcastPlan({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const location = useSelector(cropLocationByIdSelector(persistedFormData.location_id));
  const varietyId = match.params.variety_id;
  const cropVariety = useSelector(cropVarietyByID(varietyId));
  const yieldPerArea = cropVariety.yield_per_area || 0;
  const system = useSelector(measurementSelector);
  const variety_id = match.params.variety_id;
  const goBackPath = finalPlantingMethodPath(variety_id);

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  const onContinue = () => {
    history.push(addManagementPlanNamePath(variety_id));
  };

  const onBack = () => {
    history.push(goBackPath);
  };

  return (
    <HookFormPersistProvider>
      <PureBroadcastPlan
        onCancel={onCancel}
        handleContinue={onContinue}
        onGoBack={onBack}
        system={system}
        locationSize={location.total_area}
        yieldPerArea={yieldPerArea}
      />
    </HookFormPersistProvider>
  );
}

export default BroadcastPlan;
