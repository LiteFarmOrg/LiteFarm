import React, { useState } from 'react';
import { setLocationPickerManagementPlanFormData, hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { useSelector, useDispatch } from 'react-redux';
import PurePlantingLocation from '../../components/PlantingLocation';

export default function PlantingLocation({ history, match}) {
  const isTransplantPage = match?.path === '/crop/:variety_id/add_management_plan/choose_transplant_location';
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTransplantLocation, setSelectedTransplantLocation] = useState(null);

  const variety_id = match.params.variety_id;

  const persistedFormData = useSelector(hookFormPersistSelector);

  const persistedPath = isTransplantPage? 
  [`/crop/${variety_id}/add_management_plan/transplant_container`, `/crop/${variety_id}/add_management_plan/planting_method`,] : 
  [
    `/crop/${variety_id}/add_management_plan/transplant_container`,
    `/crop/${variety_id}/add_management_plan/planting_method`,
    `/crop/${variety_id}/add_management_plan/planting_date`
  ];

  const dispatch = useDispatch();

  const saveLocation = () => {
    let payload = {};
    if (isTransplantPage) {
      payload.transplantLocationId = selectedTransplantLocation.locationId;
    } else {
      payload.managementPlanLocationId = selectedLocation.locationId;
    }
    dispatch(setLocationPickerManagementPlanFormData(payload));
  }

  const onContinue = (data) => {
    saveLocation();
    if (persistedFormData.needs_transplant) {
      history.push(`/crop/${variety_id}/add_management_plan/transplant_container`);
    } else {
      history.push(`/crop/${variety_id}/add_management_plan/planting_method`);
    }
  }

  const onContinueTransplant = (data) => {
    saveLocation();
    history.push(`/crop/${variety_id}/add_management_plan/planting_method`);
  }

  const onGoBack = () => {
    if (selectedLocation !== null) {
      saveLocation();
    }
    history.push(`/crop/${variety_id}/add_management_plan/planting_date`);
  }

  const onGoBackTransplant = () => {
    if (selectedTransplantLocation !== null) {
      saveLocation();
    }
    history.push(`/crop/${variety_id}/add_management_plan/transplant_container`);
  }

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  }

  const progress = isTransplantPage? 55 : 37.5;

  return (
    <>
      <PurePlantingLocation
        selectedLocation={isTransplantPage? selectedTransplantLocation : selectedLocation}
        onContinue={isTransplantPage?  onContinueTransplant : onContinue}
        onGoBack={isTransplantPage? onGoBackTransplant : onGoBack}
        onCancel={onCancel}
        setSelectedLocation={isTransplantPage? setSelectedTransplantLocation : setSelectedLocation}
        useHookFormPersist={useHookFormPersist}
        persistedPath={persistedPath}
        persistedFormData={persistedFormData}
        transplant={isTransplantPage}
        progress={progress}
      />
    </>
  );
}
