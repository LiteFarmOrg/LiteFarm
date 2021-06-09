import PurePlantingDate from '../../../../components/Crop/PlantingDate';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

export default function PlantingDate({ history, match }) {
  return (
    <HookFormPersistProvider>
      <PurePlantingDate match={match} history={history} />
    </HookFormPersistProvider>
  );
}
