import React, { useEffect } from 'react';
import PureCompleteStepOne from '../../../components/Task/TaskComplete/StepOne';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductSelector } from '../../taskSlice';
import { productsSelector } from '../../productSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getProducts } from '../saga';

function TaskCompleteStepOne({ history, match, location }) {
  // Extracting necessary values from the Redux store using selectors
  const {
    units: { measurement: system },
    country_id,
  } = useSelector(userFarmSelector);
  const { interested, farm_id } = useSelector(certifierSurveySelector, shallowEqual);
  const task_id = match.params.task_id;
  const task = useSelector(taskWithProductSelector(task_id));
  const selectedTaskType = task.taskType;
  const products = useSelector(productsSelector);
  const persistedPaths = [`/tasks/${task_id}/complete`];

  // Handler for when the user continues to the next step
  const onContinue = (data) => {
    history.push(persistedPaths[0], location?.state);
  };

  // Handler for when the user goes back to the previous step
  const onGoBack = () => {
    history.back();
  };

  const dispatch = useDispatch();

  // Effect to dispatch the getProducts action when the component mounts
  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // Effect to set persisted paths when the component mounts or when task_id changes
  useEffect(() => {
    dispatch(
      setPersistedPaths([`/tasks/${task_id}/complete`, `/tasks/${task_id}/before_complete`]),
    );
  }, [dispatch, task_id]);

  // Generate a unique key based on products length and a timestamp
  console.log('Rendering PureCompleteStepOne with key:', JSON.stringify(products));
  return (
    <HookFormPersistProvider>
      <PureCompleteStepOne
        key={JSON.stringify(products)}
        onContinue={onContinue}
        onGoBack={onGoBack}
        system={system}
        farm={{ farm_id, country_id, interested }}
        selectedTaskType={selectedTaskType}
        products={products}
        persistedPaths={persistedPaths}
        selectedTask={task}
      />
    </HookFormPersistProvider>
  );
}

export default TaskCompleteStepOne;
