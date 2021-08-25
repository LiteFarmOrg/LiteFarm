import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PurePlantingOrHarvestDate from '../../../../components/Crop/PlantingDate/PurePlantingOrHarvestDate';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';

export default function PlantingDate({ history, match }) {
  const system = useSelector(measurementSelector);
  return (
    <HookFormPersistProvider>
      <PurePlantingOrHarvestDate
        system={system}
        variety_id={match?.params?.variety_id}
        history={history}
      />
    </HookFormPersistProvider>
  );
}
