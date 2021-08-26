import PureEditCustomTask from '../../../components/AddTask/PureEditCustomTask';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function EditCustomTask({ history, match }) {
  const onGoBackPath = '/add_task/manage_custom_tasks';
  const onEditPath = '/add_task/edit_custom_task_update';
  const persistedPaths = [onGoBackPath, onEditPath];
  const handleGoBack = () => {
    history.push(onGoBackPath);
  };

  const handleEdit = () => {
    history.push(onEditPath);
  };
  const handleRetire = () => {
    history.push(onGoBackPath);
  };

  return (
    <HookFormPersistProvider>
      <PureEditCustomTask
        handleGoBack={handleGoBack}
        persistedPaths={persistedPaths}
        handleEdit={handleEdit}
        handleRetire={handleRetire}
      />
    </HookFormPersistProvider>
  );
}

export default EditCustomTask;
