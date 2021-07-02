import React from 'react';
import { useSelector } from 'react-redux';
import PurePlantedAlready from '../../../../components/Crop/PlantedAlready';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { measurementSelector } from '../../../userFarmSlice';

function PlantedAlready({ history, match }) {

  const system = useSelector(measurementSelector);

  const onSubmit = () => {

  };

  const onGoBack = () => {

  };

  const onCancel = () => {

  };

  return (
    <HookFormPersistProvider>
      <PurePlantedAlready 
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        onCancel={onCancel}
        system={system}
      />
    </HookFormPersistProvider>
  );
}

export default PlantedAlready;