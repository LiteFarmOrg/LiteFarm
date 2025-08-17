import { useEffect } from 'react';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import PureCompleteStepOne from '../../../components/Task/TaskComplete/StepOne';
import { useSelector, shallowEqual } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductSelector } from '../../taskSlice';
import { productsForTaskTypeSelector } from '../../productSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { useDispatch } from 'react-redux';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useFilePickerUpload from '../../../components/FilePicker/useFilePickerUpload';

function TaskCompleteStepOne() {
  const location = useLocation();
  const history = useHistory();
  const {
    units: { measurement: system },
    country_id,
  } = useSelector(userFarmSelector);
  const { interested, farm_id } = useSelector(certifierSurveySelector, shallowEqual);
  const { task_id } = useParams();
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

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setPersistedPaths([`/tasks/${task_id}/complete`, `/tasks/${task_id}/before_complete`]),
    );
  }, []);

  const { isUploading, ...filePickerFunctions } = useFilePickerUpload();

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
        filePickerFunctions={filePickerFunctions}
        isUploading={isUploading}
      />
    </HookFormPersistProvider>
  );
}

export default TaskCompleteStepOne;
