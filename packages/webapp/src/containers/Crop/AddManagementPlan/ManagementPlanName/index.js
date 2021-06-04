import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import PureManagementPlanName from '../../../../components/Crop/ManagementPlanName';

export default function ManagementPlanName({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const onSubmit = () => {};
  const onError = () => {};
  return (
    <PureManagementPlanName
      onSubmit={onSubmit}
      onError={onError}
      useHookFormPersist={useHookFormPersist}
      persistedFormData={persistedFormData}
      match={match}
      history={history}
    />
  );
}
