import React from 'react';
import {
  hookFormPersistSelector,
  setManagementPlansData,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskLocations from '../../../components/Task/TaskLocations';
import { taskTypeById, taskTypeIdNoCropsSelector } from '../../taskTypeSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../../userFarmSlice';
import { cropLocationsSelector, locationsSelector } from '../../locationSlice';

export default function TaskLocationsSwitch({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const selectedTaskType = useSelector(taskTypeById(persistedFormData.type));
  const isCropLocation = selectedTaskType.task_translation_key === 'HARVESTING';
  return isCropLocation ? (
    <TaskCropLocations history={history} />
  ) : (
    <TaskAllLocations history={history} />
  );
}

function TaskCropLocations({ history }) {
  const locations = useSelector(cropLocationsSelector);
  return <TaskLocations locations={locations} history={history} />;
}

function TaskAllLocations({ history }) {
  const locations = useSelector(locationsSelector);
  return <TaskLocations locations={locations} history={history} />;
}

function TaskLocations({ history, locations }) {
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);
  const taskTypesBypassCrops = useSelector(taskTypeIdNoCropsSelector);
  const persistedPath = ['/add_task/task_date', '/add_task/task_details', '/add_task/task_crops'];

  const onCancel = () => {
    history.push('/tasks');
  };

  const onContinue = () => {
    if (taskTypesBypassCrops.includes(persistedFormData.type)) {
      dispatch(setManagementPlansData([]));
      return history.push('/add_task/task_details');
    }
    history.push('/add_task/task_crops');
  };

  const onGoBack = () => {
    history.push('/add_task/task_date');
  };

  const { grid_points } = useSelector(userFarmSelector);

  return (
    <HookFormPersistProvider>
      <PureTaskLocations
        onCancel={onCancel}
        onContinue={onContinue}
        onGoBack={onGoBack}
        persistedPath={persistedPath}
        farmCenterCoordinate={grid_points}
        locations={locations}
      />
    </HookFormPersistProvider>
  );
}
