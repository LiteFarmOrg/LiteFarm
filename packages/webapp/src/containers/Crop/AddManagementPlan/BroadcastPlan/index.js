import React from 'react';
import PureBroadcastPlan from '../../../../components/Crop/BroadcastPlan';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { measurementSelector } from '../../../userFarmSlice';
import { cropLocationByIdSelector } from '../../../locationSlice';
import { cropVarietyByID } from '../../../cropVarietySlice';

function BroadcastPlan({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const location = useSelector(cropLocationByIdSelector(persistedFormData.location_id));
  const varietyId = match.params.variety_id;
  const cropVariety = useSelector(cropVarietyByID(varietyId));
  const yieldPerArea = cropVariety.yield_per_area || 0;
  const system = useSelector(measurementSelector);
  const variety_id = match.params.variety_id;
  const persistedPaths = [
    `/crop/${variety_id}/add_management_plan/name`,
    `/crop/${variety_id}/add_management_plan/planting_method`,
  ];
  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  const onContinue = () => {
    history.push(persistedPaths[0]);
  };

  const onBack = () => {
    history.push(`/crop/${variety_id}/add_management_plan/planting_method`);
  };

  return (
    <PureBroadcastPlan
      onCancel={onCancel}
      handleContinue={onContinue}
      onGoBack={onBack}
      system={system}
      persistedForm={persistedFormData}
      persistedPaths={persistedPaths}
      locationSize={location.total_area}
      yieldPerArea={yieldPerArea}
    />
  );
}

export default BroadcastPlan;
