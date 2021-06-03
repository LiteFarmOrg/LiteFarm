import PurePlantingDate from '../../components/PlantingDate';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';

export default function PlantingDate() {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const onSubmit = () => {};
  const onError = () => {};
  const onGoBack = () => {};
  const onCancel = () => {};

  return (
    <PurePlantingDate
      useHookFormPersist={useHookFormPersist}
      persistedFormData={persistedFormData}
      onSubmit={onSubmit}
      onError={onError}
      onGoBack={onGoBack}
      onCancel={onCancel}
    />
  );
}
