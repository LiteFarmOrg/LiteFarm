import React from 'react';
import { useSelector } from 'react-redux';
import PurePlantedAlready from '../../../../components/Crop/PlantedAlready';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { measurementSelector } from '../../../userFarmSlice';

function PlantedAlready({ history, match }) {
  const system = useSelector(measurementSelector);
  const variety_id = match?.params?.variety_id;

  const persistPath = `/crop/${variety_id}/add_management_plan/needs_transplant`;

  const onSubmit = () => {
    history.push(persistPath);
  };

  const onGoBack = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  return (
    <HookFormPersistProvider>
      <PurePlantedAlready
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        onCancel={onCancel}
        persistPath={persistPath}
        system={system}
      />
    </HookFormPersistProvider>
  );
}

export default PlantedAlready;
