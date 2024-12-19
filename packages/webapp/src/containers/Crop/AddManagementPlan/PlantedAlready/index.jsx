import { useSelector } from 'react-redux';
import PurePlantedAlready from '../../../../components/Crop/PlantedAlready';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { useParams } from 'react-router-dom-v5-compat';

function PlantedAlready() {
  let { variety_id } = useParams();
  const system = useSelector(measurementSelector);
  const cropVariety = useSelector(cropVarietySelector(variety_id));

  return (
    <HookFormPersistProvider>
      <PurePlantedAlready system={system} cropVariety={cropVariety} />
    </HookFormPersistProvider>
  );
}

export default PlantedAlready;
