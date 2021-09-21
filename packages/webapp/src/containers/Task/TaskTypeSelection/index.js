import { PureTaskTypeSelection } from '../../../components/Task/PureTaskTypeSelection/PureTaskTypeSelection';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useEffect } from 'react';
import { getTaskTypes } from '../saga';
import { defaultTaskTypesSelector, userCreatedTaskTypes } from '../../taskTypeSlice';
import { showedSpotlightSelector } from '../../showedSpotlightSlice';
import { PlantingTaskModal } from '../../../components/Modals/PlantingTaskModal';
import { setSpotlightToShown } from '../../Map/saga';

function TaskTypeSelection({ history, match }) {
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const taskTypes = useSelector(defaultTaskTypesSelector);
  const customTasks = useSelector(userCreatedTaskTypes);
  const continuePath = '/add_task/task_date';
  const customTaskPath = '/add_task/manage_custom_tasks';
  const persistedPaths = [continuePath, customTaskPath];
  const { planting_task: shouldNotShowPlantTaskSpotLight } = useSelector(showedSpotlightSelector);
  const isAdmin = useSelector(isAdminSelector);

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
    history.push('/tasks');
  };

  const onError = () => {};

  const dismissPlantingTaskModal = () => dispatch(setSpotlightToShown('planting_task'));
  const goToCatalogue = () => {
    dismissPlantingTaskModal();
    history.push('/crop_catalogue');
  };

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
          shouldNotShowPlantTaskSpotLight={shouldNotShowPlantTaskSpotLight}
        >
          <PlantingTaskModal
            goToCatalogue={goToCatalogue}
            dismissModal={dismissPlantingTaskModal}
          />
        </PureTaskTypeSelection>
      </HookFormPersistProvider>
    </>
  );
}

export default TaskTypeSelection;
