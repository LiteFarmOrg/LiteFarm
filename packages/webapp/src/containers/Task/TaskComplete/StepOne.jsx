import React from 'react';
import PureCompleteStepOne from '../../../components/Task/TaskComplete/StepOne';
import { useSelector, shallowEqual } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductSelector } from '../../taskSlice';
import { productsForTaskTypeSelector } from '../../productSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';

function TaskCompleteStepOne({ history, match, location }) {
  const {
    units: { measurement: system },
    country_id,
  } = useSelector(userFarmSelector);
  const { interested, farm_id } = useSelector(certifierSurveySelector, shallowEqual);
  const task_id = match.params.task_id;
  const task = useSelector(taskWithProductSelector(task_id));
  const selectedTaskType = task?.taskType;
  const products = useSelector(productsForTaskTypeSelector(selectedTaskType));
  const persistedPaths = [`/tasks/${task_id}/complete`];

  const onContinue = (data) => {
    history.push(persistedPaths[0], location?.state);
  };

  const onGoBack = () => {
    history.back();
  };

  return (
    <HookFormPersistProvider>
      <PureCompleteStepOne
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
