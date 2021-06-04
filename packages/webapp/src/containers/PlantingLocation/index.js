import React, { useState } from 'react';
import { setLocationPickerManagementPlanFormData, hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { useSelector, useDispatch } from 'react-redux';
import PurePlantingLocation from '../../components/PlantingLocation';

export default function PlantingLocation({ history, match}) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const variety_id = match.params.variety_id;

  const persistedFormData = useSelector(hookFormPersistSelector);

  // TODO - add persist path for LF-1338
  const persistedPath = [`/path`];

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
      // TODO - add path 
      console.log("Go to 1344");
    } else {
      // TODO - add path 
      console.log("Go to 1340");
    }
  }

  const onGoBack = () => {
    if (selectedLocation !== null) {
      saveLocation();
      // TODO - add path
      console.log('Go back to choose date');
    } else {
      // TODO - add path
      console.log('Go back to choose date');
    }
    
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


