import React, { useState } from 'react';
import { setLocationPickerManagementPlanFormData, hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { useSelector, useDispatch } from 'react-redux';
import PurePlantingLocation from '../../components/PlantingLocation';



export default function PlantingLocation({ history, match}) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  console.log(selectedLocation);

  const variety_id = match.params.variety_id;

  const dispatch = useDispatch();

  const persistedFormData = useSelector(hookFormPersistSelector);

  const onContinue = (data) => {
    // TODO - add path 
    if (persistedFormData.needs_transplant === 'true') {
      console.log("Go to 1344");
    } else {
      console.log("Go to 1340");
    }
    if (selectedLocation.asset === 'area') {
      dispatch(setLocationPickerManagementPlanFormData(selectedLocation.area.location_id));
    } else {
      dispatch(setLocationPickerManagementPlanFormData(selectedLocation.line.location_id));
    }
  }

  const onGoBack = () => {
    history.push(`/crop/${variety_id}/add_management_plan`);
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
        persistedFormData={persistedFormData}
        variety_id={variety_id}
      />
    </>
  );
}
