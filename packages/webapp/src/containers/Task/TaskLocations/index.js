import React, { useState } from 'react';
import {
  hookFormPersistSelector,
  setTaskLocationsData,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskLocations from '../../../components/Task/TaskLocations';
import { taskTypeNoCrops } from '../../taskTypeSlice';

export default function TaskLocations({ history }) {
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);
  const taskTypesBypassCrops = useSelector(taskTypeNoCrops);
  const persistedPath = ['/add_task/task_date', '/add_task/task_notes'];

  //TODO: Remove this, make the location picker produce or accept [{location_id}] instead of [location_id]
  let task_locations = persistedFormData?.locations?.map(({location_id}) => location_id);
  if (task_locations === undefined) {
    task_locations = [];
  }
  const [taskLocations, setTaskLocations] = useState([]);

  const locationsAsLocationIdObjects = locations => locations.map(l => ({ location_id: l }))

  const onCancel = () => {
    history.push('/tasks');
  };

  const onContinue = () => {
    dispatch(setTaskLocationsData(locationsAsLocationIdObjects(taskLocations)))
    taskTypesBypassCrops.includes(persistedFormData.type) ?
      history.push('/add_task/task_notes'):
      console.log('Continue to LF-1568/Does it involve crops? or LF-1570');
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
