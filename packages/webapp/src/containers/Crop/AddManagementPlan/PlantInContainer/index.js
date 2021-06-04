import PurePlantInContainer from '../../../../components/Crop/PlantInContainer';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { measurementSelector } from '../../../userFarmSlice';

export default function PlantInContainer({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const system = useSelector(measurementSelector);
  return (
    <PurePlantInContainer
      useHookFormPersist={useHookFormPersist}
      persistedFormData={persistedFormData}
      match={match}
      history={history}
      system={system}
    />
  );
}
