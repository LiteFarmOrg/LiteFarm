import React, { useState } from 'react';
import {
  hookFormPersistSelector,
  setWildCropLocation,
  setTransplantContainerLocationIdManagementPlanFormData,
  setTaskLocations,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskLocations from '../../../components/Task/TaskLocations';

export default function TaskLocations({ history }) {
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);

  const persistedPath = ['/tasks/1/add_task/task_date'];

  const [taskLocations, setTaskLocations] = useState([]);

  console.log(taskLocations);
 
  const onCancel = () => {
  }

  const onContinue = () => {
  }

  const onGoBack = () => {
    //dispatch(setTaskLocations(taskLocations));
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