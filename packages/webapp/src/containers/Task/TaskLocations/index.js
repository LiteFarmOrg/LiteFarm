import React, { useState } from 'react';
import {
  hookFormPersistSelector,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskLocations from '../../../components/Task/TaskLocations';

export default function TaskLocations({ history }) {

  const [taskLocations, setTaskLocations] = useState([]);
  //console.log(taskLocations);
 
  const onCancel = () => {
  }

  const onContinue = () => {
  }

  const onGoBack = () => {
    //
  }


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