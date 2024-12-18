import PureEditCustomTask from '../../../components/Task/PureEditCustomTask';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTaskType } from '../saga';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { taskTypeSelector } from '../../taskTypeSlice';
import { useNavigate } from 'react-router';

function EditCustomTask() {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const onGoBackPath = '/add_task/manage_custom_tasks';
  const onEditPath = '/add_task/edit_custom_task_update';
  const persistedPaths = [onGoBackPath, onEditPath];
  const { persistedData } = useHookFormPersist();
  const selectedTaskType = useSelector(taskTypeSelector(persistedData.task_type_id));
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(onEditPath);
  };
  const handleRetire = () => {
    dispatch(deleteTaskType(persistedData.task_type_id));
  };

  return (
    <HookFormPersistProvider>
      <PureEditCustomTask
        handleGoBack={handleGoBack}
        persistedPaths={persistedPaths}
        handleEdit={handleEdit}
        handleRetire={handleRetire}
        selectedType={selectedTaskType}
      />
    </HookFormPersistProvider>
  );
}

export default EditCustomTask;
