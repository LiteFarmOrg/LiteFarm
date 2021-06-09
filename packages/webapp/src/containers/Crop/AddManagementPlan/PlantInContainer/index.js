import PurePlantInContainer from '../../../../components/Crop/PlantInContainer';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

export default function PlantInContainer({ history, match }) {
  const system = useSelector(measurementSelector);
  return (
    <HookFormPersistProvider>
      <PurePlantInContainer match={match} history={history} system={system} />
    </HookFormPersistProvider>
  );
}
