import React from 'react';
import PureCompleteOnCreation from '../../../components/Task/TaskComplete/CompleteOnCreation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductSelector } from '../../taskSlice';
import { productsSelector } from '../../productSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import {
  setPersistedPaths,
  setFormData,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';

function TaskCompleteOnCreation({ history, match, location }) {
  const {
    units: { measurement: system },
    country_id,
  } = useSelector(userFarmSelector);
  const { interested, farm_id } = useSelector(certifierSurveySelector, shallowEqual);
  const task_id = match.params.task_id;
  const task = useSelector(taskWithProductSelector(task_id));
  const selectedTaskType = task.taskType;
  const products = useSelector(productsSelector);
  const persistedPaths = [`/tasks/${task_id}/before_complete`];
  const dispatch = useDispatch();

  const onContinue = (data) => {
    dispatch(
      setPersistedPaths([
        `/tasks/${task_id}/complete_harvest_quantity`,
        `/tasks/${task_id}/complete`,
        `/tasks/${task_id}/before_complete`,
        `/tasks/${task_id}/harvest_uses`,
      ]),
    );
    if (selectedTaskType.task_translation_key == 'HARVEST_TASK') {
      dispatch(setFormData({ task_id, taskType: task.taskType }));
      history.push(`/tasks/${task_id}/complete_harvest_quantity`, location?.state);
    } else if (selectedTaskType.farm_id == farm_id) {
      dispatch(setFormData({ task_id, taskType: task.taskType }));
      history.push(`/tasks/${task_id}/complete`, location?.state);
    } else {
      dispatch(setFormData({ task_id, taskType: task.taskType }));
      history.push(`/tasks/${task_id}/before_complete`, location?.state);
    }
  };

  const onGoBack = () => {
    history.back();
  };

  return (
    <HookFormPersistProvider>
      <PureCompleteOnCreation
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

export default TaskCompleteOnCreation;
