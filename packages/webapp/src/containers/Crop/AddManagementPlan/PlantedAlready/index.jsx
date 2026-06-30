import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PurePlantedAlready from '../../../../components/Crop/PlantedAlready';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';

function PlantedAlready() {
  const location = useLocation();
  const history = useHistory();
  const system = useSelector(measurementSelector);
  const { variety_id } = useParams();
  const cropVariety = useSelector(cropVarietySelector(variety_id));

  return (
    <HookFormPersistProvider>
      <PurePlantedAlready
        system={system}
        cropVariety={cropVariety}
        history={history}
        location={location}
      />
    </HookFormPersistProvider>
  );
}

export default PlantedAlready;
