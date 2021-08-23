import PureTaskDetails from '../../../components/AddTask/PureTaskDetails';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../../Task/saga';
import { productEntitiesSelector } from '../../productSlice';
import { taskTypeById, taskTypeIdNoCropsSelector } from '../../taskTypeSlice';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { userFarmSelector, measurementSelector } from '../../userFarmSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';

function TaskDetails({ history, match }) {
  const continuePath = '/add_task/task_assignment';
  const goBackPath = '/add_task/task_locations';
  const dispatch = useDispatch();
  const { country_id, units: {measurement: system }} = useSelector(userFarmSelector);
  const { interested, farm_id } = useSelector(certifierSurveySelector, shallowEqual);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const products = useSelector(productEntitiesSelector);
  const taskTypesBypassCrops = useSelector(taskTypeIdNoCropsSelector);
  const selectedTaskType = useSelector(taskTypeById(persistedFormData.type));
  const persistedPaths = [goBackPath, continuePath];

  const handleGoBack = () => {
    taskTypesBypassCrops.includes(persistedFormData.type)
      ? history.push('/add_task/task_locations')
      : history.push('/add_task/task_crops');
  };

  const handleCancel = () => {
    history.push('/tasks');
  };

  const onSubmit = () => {
    history.push('/add_task/task_assignment');
  };

  const onError = () => {};

  useEffect(() => {
    dispatch(getProducts());
  }, []);

  return (
    <HookFormPersistProvider>
      <PureTaskDetails
        handleCancel={handleCancel}
        handleGoBack={handleGoBack}
        onError={onError}
        onSubmit={onSubmit}
        persistedPaths={persistedPaths}
        selectedTaskType={selectedTaskType}
        system={system}
        products={products}
        farm={{ farm_id, country_id, interested }}
      />
    </HookFormPersistProvider>
  );
}

export default TaskDetails;
