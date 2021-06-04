import React, { useState } from 'react';
import { setLocationPickerManagementPlanFormData, hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { useSelector, useDispatch } from 'react-redux';
import PurePlantingLocation from '../../components/PlantingLocation';

export default function PlantingLocation({ history, match}) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const variety_id = match.params.variety_id;

  const persistedFormData = useSelector(hookFormPersistSelector);

  const persistedPath = [
    `/crop/${variety_id}/add_management_plan/transplant_container`,
    `/crop/${variety_id}/add_management_plan/planting_method`,
    `/crop/${variety_id}/add_management_plan/planting_date`
  ];

  const dispatch = useDispatch();

  const saveLocation = () => {
    if (selectedLocation.asset === 'area') {
      dispatch(setLocationPickerManagementPlanFormData(selectedLocation.area.location_id));
    } else {
      dispatch(setLocationPickerManagementPlanFormData(selectedLocation.line.location_id));
    }
  }

  const onContinue = (data) => {
    saveLocation();
    if (persistedFormData.needs_transplant === 'true') {
      history.push(`/crop/${variety_id}/add_management_plan/transplant_container`);
    } else {
      history.push(`/crop/${variety_id}/add_management_plan/planting_method`);
    }
  }

  const onGoBack = () => {
    if (selectedLocation !== null) {
      saveLocation();
    }
    history.push(`/crop/${variety_id}/add_management_plan/planting_date`);
  }

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  }

  const progress = 37.5;

  return (
    <>
      <PurePlantingLocation
        selectedLocation={selectedLocation}
        onContinue={onContinue}
        onGoBack={onGoBack}
        onCancel={onCancel}
        setSelectedLocation={setSelectedLocation}
        useHookFormPersist={useHookFormPersist}
        persistedPath={persistedPath}
        persistedFormData={persistedFormData}
      />
    </>
  );
}
