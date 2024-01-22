import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import PurePlantingLocation from '../../../../components/Crop/PlantingLocation';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { cropLocationsSelector } from '../../../locationSlice';
import { userFarmSelector } from '../../../userFarmSlice';
import { certifierSurveySelector } from '../../../OrganicCertifierSurvey/slice';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import TransplantSpotlight from './TransplantSpotlight';
import { cropVarietySelector } from '../../../cropVarietySlice.js';

export default function PlantingLocation({ history, match }) {
  const isFinalLocationPage =
    match?.path === '/crop/:variety_id/add_management_plan/choose_final_planting_location';
  const variety_id = match.params.variety_id;
  const crop = useSelector(cropVarietySelector(variety_id));
  const cropLocations = useSelector(cropLocationsSelector);
  const { default_initial_location_id } = useSelector(userFarmSelector);
  const {
    crop_management_plan: { already_in_ground, is_wild, for_cover, needs_transplant, is_seed },
  } = useSelector(hookFormPersistSelector);
  const { grid_points } = useSelector(userFarmSelector);
  const { interested } = useSelector(certifierSurveySelector);

  return (
    <Fragment key={`${variety_id}-${isFinalLocationPage}`}>
      <HookFormPersistProvider>
        <PurePlantingLocation
          isFinalLocationPage={isFinalLocationPage}
          variety_id={variety_id}
          history={history}
          cropLocations={cropLocations}
          default_initial_location_id={default_initial_location_id}
          farmCenterCoordinate={grid_points}
          isCropOrganic={crop.organic}
          isPursuingCertification={interested}
        />
      </HookFormPersistProvider>
      {needs_transplant && !already_in_ground && <TransplantSpotlight is_seed={is_seed} />}
    </Fragment>
  );
}
