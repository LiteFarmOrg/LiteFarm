import React, { useState } from 'react';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { useSelector } from 'react-redux';
import PurePlantingLocation from '../../components/PlantingLocation';

export default function PlantingLocation({ history, match}) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const variety_id = match.params.variety_id;

  const persistedFormData = useSelector(hookFormPersistSelector);

  // TODO - add persist path for LF-1338
  const persistedPath = [`/path`];

  const onContinue = (data) => {
    // TODO - add path 
    if (persistedFormData.needs_transplant === 'true') {
      console.log("Go to 1344");
    } else {
      console.log("Go to 1340");
    }
  }

  const onGoBack = () => {
    // TODO - add path
    console.log('Go back to choose date');
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


