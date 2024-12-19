import { useEffect } from 'react';
import PureCompleteStepOne from '../../../components/Task/TaskComplete/StepOne';
import { useSelector, shallowEqual } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductSelector } from '../../taskSlice';
import { productsForTaskTypeSelector } from '../../productSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { useDispatch } from 'react-redux';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useLocation, useNavigate, useParams } from 'react-router-dom-v5-compat';

function TaskCompleteStepOne() {
  let navigate = useNavigate();
  let location = useLocation();
  const {
    units: { measurement: system },
    country_id,
  } = useSelector(userFarmSelector);
  const { interested, farm_id } = useSelector(certifierSurveySelector, shallowEqual);
  let { task_id } = useParams();
  const task = useSelector(taskWithProductSelector(task_id));
  const selectedTaskType = task?.taskType;
  const products = useSelector(productsForTaskTypeSelector(selectedTaskType));
  const persistedPaths = [`/tasks/${task_id}/complete`];

  const onContinue = (data) => {
    navigate(persistedPaths[0], { state: location?.state });
  };

  const onGoBack = () => {
    navigate(-1);
  };

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setPersistedPaths([`/tasks/${task_id}/complete`, `/tasks/${task_id}/before_complete`]),
    );
  }, []);

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
