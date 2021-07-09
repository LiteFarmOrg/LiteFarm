import React from 'react';
import { useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureNextHarvest from '../../../../components/Crop/NextHarvest';
import { measurementSelector } from '../../../userFarmSlice';

function NextHarvest({ history, match }) {
  const system = useSelector(measurementSelector);

  const onCancel = () => {

  }
  const onGoBack = () => {
    
  }

  const onContinue = () => {
    
  }

  return (
    <HookFormPersistProvider>
      <PureNextHarvest
        onContinue={onContinue}
        onGoBack={onGoBack}
        onCancel={onCancel}
        system={system}
      />
    </HookFormPersistProvider>
  );
}

export default NextHarvest;