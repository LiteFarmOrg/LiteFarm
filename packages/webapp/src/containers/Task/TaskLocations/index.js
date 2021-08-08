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

  const persistedPath = ['/tasks/1/add_task/task_date'];

  let task_locations = persistedFormData.task_locations;
  if (task_locations === undefined) {
    task_locations = [];
  }
  const [taskLocations, setTaskLocations] = useState([]);

  console.log(taskLocations);
 
  const onCancel = () => {
  }

  const onContinue = () => {
  }

  const onGoBack = () => {
    dispatch(setTaskLocationsData(taskLocations));
    history.push('/tasks/1/add_task/task_date');
  };

  useHookFormPersist(persistedPath, () => ({}));


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