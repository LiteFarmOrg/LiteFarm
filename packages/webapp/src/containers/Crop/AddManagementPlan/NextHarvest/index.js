import React from 'react';
import { useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureNextHarvest from '../../../../components/Crop/PlantingDate/NextHarvest';
import { measurementSelector } from '../../../userFarmSlice';

function NextHarvest({ history, match }) {
  const variety_id = match.params.variety_id;
  const system = useSelector(measurementSelector);

  return (
    <HookFormPersistProvider>
      <PureNextHarvest system={system} variety={variety_id} />
    </HookFormPersistProvider>
  );
}

export default NextHarvest;
