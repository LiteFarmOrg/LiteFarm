import PureTaskDetails from '../../../components/AddTask/PureTaskDetails';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../../Task/saga';
import { productEntitiesSelector } from '../../productSlice';
import { taskTypeById, taskTypeNoCrops } from '../../taskTypeSlice';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { loginSelector, measurementSelector } from '../../userFarmSlice';

function TaskDetails({ history, match }) {
  const continuePath = '/add_task/task_assignment';
  const goBackPath = '/add_task/task_locations';
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { farm_id } = useSelector(loginSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const products = useSelector(productEntitiesSelector);
  const taskTypesBypassCrops = useSelector(taskTypeNoCrops);
  const selectedTaskType = useSelector(taskTypeById(persistedFormData.type))
  const persistedPaths = [goBackPath, continuePath];

  const handleGoBack = () => {
    taskTypesBypassCrops.includes(persistedFormData.type) ?
      history.push('/add_task/task_locations'):
      history.push('/add_task/task_locations'); // <- This should be crop selection
  };

  const handleCancel = () => {
    history.push('/tasks')
  };

  const onSubmit = () => {
    history.push('/add_task/task_assignment');
  };

  const onError = () => {};

  useEffect(() => {
    dispatch(getProducts())
  }, [])

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
        farm={farm_id}
      />
    </HookFormPersistProvider>
  );
}

export default TaskDetails;
