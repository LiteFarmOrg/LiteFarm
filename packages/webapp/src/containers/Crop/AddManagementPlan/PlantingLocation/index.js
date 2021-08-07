import React from 'react';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useSelector } from 'react-redux';
import PurePlantingLocation from '../../../../components/Crop/PlantingLocation';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { cropLocationsSelector } from '../../../locationSlice';

export default function PlantingLocation({ history, match }) {
  const isFinalLocationPage =
    match?.path === '/crop/:variety_id/add_management_plan/choose_final_planting_location';
  const variety_id = match.params.variety_id;
  const cropLocations = useSelector(cropLocationsSelector);

  const persistedFormData = useSelector(hookFormPersistSelector);
  const {
    crop_management_plan: { needs_transplant, is_seed, already_in_ground },
  } = persistedFormData;

  return (
    <HookFormPersistProvider>
      <PurePlantingLocation
        isFinalLocationPage={isFinalLocationPage}
        variety_id={variety_id}
        history={history}
        cropLocations={cropLocations}
      />
      {/*{needs_transplant && !already_in_ground && <TransplantSpotlight is_seed={is_seed} />}*/}
    </HookFormPersistProvider>
  );
}
