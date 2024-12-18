import React from 'react';
import { useSelector } from 'react-redux';
import PurePlantedAlready from '../../../../components/Crop/PlantedAlready';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { useParams } from 'react-router-dom';

function PlantedAlready({ location }) {
  let { variety_id } = useParams();
  const system = useSelector(measurementSelector);
  const cropVariety = useSelector(cropVarietySelector(variety_id));

  return (
    <HookFormPersistProvider>
      <PurePlantedAlready system={system} cropVariety={cropVariety} location={location} />
    </HookFormPersistProvider>
  );
}

export default PlantedAlready;
