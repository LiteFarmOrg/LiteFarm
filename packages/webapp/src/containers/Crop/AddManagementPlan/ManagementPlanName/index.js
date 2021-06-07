import { useDispatch, useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import PureManagementPlanName from '../../../../components/Crop/ManagementPlanName';

export default function ManagementPlanName({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    formatManagementPlanFormData({ ...persistedFormData, ...data });
    // dispatch(postManagementPlan(formatManagementPlanFormData(data)));
  };
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

const formatManagementPlanFormData = (data) => {
  const reqBody = {};
  return reqBody;
};
