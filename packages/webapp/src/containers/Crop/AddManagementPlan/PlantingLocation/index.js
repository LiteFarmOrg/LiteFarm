import React from 'react';
import { useSelector } from 'react-redux';
import PurePlantingLocation from '../../../../components/Crop/PlantingLocation';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { cropLocationsSelector } from '../../../locationSlice';

export default function PlantingLocation({ history, match }) {
  const isFinalLocationPage =
    match?.path === '/crop/:variety_id/add_management_plan/choose_final_planting_location';
  const variety_id = match.params.variety_id;
  const cropLocations = useSelector(cropLocationsSelector);
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
