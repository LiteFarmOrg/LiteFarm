import React, { useState } from 'react';
import {
  hookFormPersistSelector,
  setTaskLocationsData,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskLocations from '../../../components/Task/TaskLocations';

export default function TaskLocations({ history }) {
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);

  const persistedPath = ['/add_task/task_date', '/add_task/task_crops'];

  let task_locations = persistedFormData.task_locations;
  if (task_locations === undefined) {
    task_locations = [];
  }
  const [taskLocations, setTaskLocations] = useState([]);

  const onCancel = () => {
    history.push('/tasks');
  };

  const onContinue = () => {
    dispatch(setTaskLocationsData(taskLocations));
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
