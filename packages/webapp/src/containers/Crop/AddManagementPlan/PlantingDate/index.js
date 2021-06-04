import PurePlantingDate from '../../../../components/Crop/PlantingDate';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

export default function PlantingDate({ history, match }) {
  const variety_id = match.params.variety_id;
  const persistedFormData = useSelector(hookFormPersistSelector);

  return (
    <PurePlantingDate
      useHookFormPersist={useHookFormPersist}
      persistedFormData={persistedFormData}
      match={match}
      history={history}
    />
  );
}
