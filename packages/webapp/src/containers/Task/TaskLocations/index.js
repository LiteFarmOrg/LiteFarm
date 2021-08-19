import React, { useState } from 'react';
import {
  hookFormPersistSelector,
  setManagementPlansData,
  setTaskLocationsData,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskLocations from '../../../components/Task/TaskLocations';
import { taskTypeIdNoCropsSelector } from '../../taskTypeSlice';

export default function TaskLocations({ history }) {
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);
  const taskTypesBypassCrops = useSelector(taskTypeIdNoCropsSelector);
  const persistedPath = ['/add_task/task_date', '/add_task/task_details', '/add_task/task_crops'];

  //TODO: Remove this, make the location picker produce or accept [{location_id}] instead of [location_id]
  let task_locations = persistedFormData?.locations?.map(({ location_id }) => location_id);
  if (task_locations === undefined) {
    task_locations = [];
  }
  const [taskLocations, setTaskLocations] = useState([]);

  const locationsAsLocationIdObjects = (locations) => locations.map((l) => ({ location_id: l }));

  const onCancel = () => {
    history.push('/tasks');
  };

  const onContinue = () => {
    dispatch(setTaskLocationsData(locationsAsLocationIdObjects(taskLocations)));
    if (taskTypesBypassCrops.includes(persistedFormData.type)) {
      dispatch(setManagementPlansData([]));
      return history.push('/add_task/task_details');
    }
    history.push('/add_task/task_crops');
  };

  const onGoBack = () => {
    dispatch(setTaskLocationsData(taskLocations));
    history.push('/add_task/task_date');
  };

  useHookFormPersist(() => ({}), persistedPath);

  return (
    <PureTaskLocations
      onCancel={onCancel}
      onContinue={onContinue}
      onGoBack={onGoBack}
      setTaskLocations={setTaskLocations}
      taskLocations={taskLocations}
      storedLocations={task_locations}
    />
  );
}
