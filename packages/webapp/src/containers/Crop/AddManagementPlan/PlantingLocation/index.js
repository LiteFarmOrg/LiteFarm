import React, { useState } from 'react';
import {
  hookFormPersistSelector,
  setDefaultInitialLocation,
  setFinalLocationIdManagementPlanFormData,
  setInitialLocationIdManagementPlanFormData,
  setWildCropLocation,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { useDispatch, useSelector } from 'react-redux';
import PurePlantingLocation from '../../../../components/Crop/PlantingLocation';
import TransplantSpotlight from './TransplantSpotlight';

export default function PlantingLocation({ history, match }) {
  const isFinalLocationPage =
    match?.path === '/crop/:variety_id/add_management_plan/choose_final_planting_location';
  const persistedFormData = useSelector(hookFormPersistSelector);

  const [selectedLocationId, setLocationId] = useState(
    isFinalLocationPage
      ? persistedFormData?.crop_management_plan?.planting_management_plans?.final?.location_id
      : persistedFormData?.crop_management_plan?.planting_management_plans?.initial?.location_id,
  );
  const [pinLocation, setPinLocation] = useState(
    persistedFormData?.crop_management_plan?.planting_management_plans?.final?.pin_coordinate,
  );
  const variety_id = match.params.variety_id;

  const isWildCrop = Boolean(persistedFormData?.crop_management_plan.is_wild);
  const isInGround = Boolean(persistedFormData?.crop_management_plan.already_in_ground);
  const isTransplant = Boolean(persistedFormData?.crop_management_plan.needs_transplant);

  const dispatch = useDispatch();
  //TODO: remove [selectedLocationId, setLocationId] and use state from persistedHookForm instead
  const onContinue = (data) => {
    if (!isFinalLocationPage) {
      dispatch(setInitialLocationIdManagementPlanFormData(selectedLocationId));
      history.push(`/crop/${variety_id}/add_management_plan/final_planting_method`);
    } else if (isWildCrop && !isTransplant) {
      pinLocation
        ? setWildCropLocation(pinLocation)
        : dispatch(setFinalLocationIdManagementPlanFormData(selectedLocationId));
      dispatch(setFinalLocationIdManagementPlanFormData(selectedLocationId));
      history.push(`/crop/${variety_id}/add_management_plan/name`);
    } else if (isWildCrop && isTransplant) {
      pinLocation
        ? setWildCropLocation(pinLocation)
        : dispatch(setFinalLocationIdManagementPlanFormData(selectedLocationId));
      dispatch(setFinalLocationIdManagementPlanFormData(selectedLocationId));
      history.push(`/crop/${variety_id}/add_management_plan/choose_final_planting_location`);
    } else if (isInGround && isTransplant) {
      dispatch(setFinalLocationIdManagementPlanFormData(selectedLocationId));
      history.push(`/crop/${variety_id}/add_management_plan/initial_planting_method`);
    } else {
      dispatch(setFinalLocationIdManagementPlanFormData(selectedLocationId));
      history.push(`/crop/${variety_id}/add_management_plan/final_planting_method`);
    }
  };

  const onGoBack = () => {
    if (!isFinalLocationPage) {
      if (isInGround) {
        dispatch(setInitialLocationIdManagementPlanFormData(selectedLocationId));
        history.push(`/crop/${variety_id}/add_management_plan/initial_planting_method`);
      } else {
        dispatch(setInitialLocationIdManagementPlanFormData(selectedLocationId));
        history.push(`/crop/${variety_id}/add_management_plan/initial_container_method`);
      }
    } else {
      dispatch(setFinalLocationIdManagementPlanFormData(selectedLocationId));
      if (isWildCrop) {
        history.push(`/crop/${variety_id}/add_management_plan/next_harvest`);
      } else {
        history.push(`/crop/${variety_id}/add_management_plan/plant_date`);
      }
    }
  };

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  const progress = isFinalLocationPage ? 50 : 37.5;

  const {
    crop_management_plan: { needs_transplant, is_seed, already_in_ground },
  } = persistedFormData;

  const onSelectCheckbox = (e) => {
    if (!e?.target?.checked) {
      dispatch(setDefaultInitialLocation(undefined));
    } else {
      dispatch(setDefaultInitialLocation(selectedLocationId));
    }
  };

  useHookFormPersist(() => ({}));

  return (
    <>
      <PurePlantingLocation
        selectedLocationId={selectedLocationId}
        onContinue={onContinue}
        onGoBack={onGoBack}
        onCancel={onCancel}
        setLocationId={setLocationId}
        useHookFormPersist={useHookFormPersist}
        persistedFormData={persistedFormData}
        transplant={isFinalLocationPage}
        progress={progress}
        setPinLocation={setPinLocation}
        pinLocation={pinLocation}
        onSelectCheckbox={onSelectCheckbox}
      />
      {needs_transplant && !already_in_ground && <TransplantSpotlight is_seed={is_seed} />}
    </>
  );
}
