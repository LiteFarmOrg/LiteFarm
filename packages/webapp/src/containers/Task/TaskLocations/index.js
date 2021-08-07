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

  console.log('persistedFormData', persistedFormData);

  const [taskLocations, setTaskLocations] = useState(persistedFormData?.task_locations);

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
    />
  );
}