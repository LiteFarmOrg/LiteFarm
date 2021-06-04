import PurePlantingMethod from '../../../../components/Crop/PlantingMethod';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

export default function PlantingMethod({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);

  return (
    <PurePlantingMethod
      useHookFormPersist={useHookFormPersist}
      persistedFormData={persistedFormData}
      match={match}
      history={history}
    />
  );
}
