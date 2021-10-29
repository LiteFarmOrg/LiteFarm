import { PureTaskTypeSelection } from '../../../components/Task/PureTaskTypeSelection/PureTaskTypeSelection';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useEffect } from 'react';
import { getTaskTypes } from '../saga';
import { defaultTaskTypesSelector, userCreatedTaskTypesSelector } from '../../taskTypeSlice';
import { showedSpotlightSelector } from '../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../Map/saga';
import { hookFormPersistEntryPathSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';

function TaskTypeSelection({ history, match }) {
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const taskTypes = useSelector(defaultTaskTypesSelector);
  const customTasks = useSelector(userCreatedTaskTypesSelector);
  const continuePath = '/add_task/task_date';
  const customTaskPath = '/add_task/manage_custom_tasks';
  const persistedPaths = [continuePath, customTaskPath];
  const { planting_task } = useSelector(showedSpotlightSelector);
  const isAdmin = useSelector(isAdminSelector);
  const entryPath = useSelector(hookFormPersistEntryPathSelector);

  useEffect(() => {
    dispatch(getTaskTypes());
  }, []);

  const onCustomTask = () => {
    history.push(customTaskPath);
  };

  const onContinue = () => history.push(continuePath);

  const handleGoBack = () => {
    history.push('/tasks');
  };

  const handleCancel = () => {
    history.push(entryPath);
  };

  const onError = () => {};

  const updatePlantTaskSpotlight = () => dispatch(setSpotlightToShown('planting_task'));

  return (
    <>
      <HookFormPersistProvider>
        <PureTaskTypeSelection
          history={history}
          onCustomTask={onCustomTask}
          handleCancel={handleCancel}
          handleGoBack={handleGoBack}
          persistedPaths={persistedPaths}
          onContinue={onContinue}
          onError={onError}
          taskTypes={taskTypes}
          customTasks={customTasks}
          isAdmin={isAdmin}
          shouldShowPlantTaskSpotLight={!planting_task}
          updatePlantTaskSpotlight={updatePlantTaskSpotlight}
        />
      </HookFormPersistProvider>
    </>
  );
}

export default TaskTypeSelection;
