import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureAddCustomTask from '../../../components/AddTask/PureAddCustomTask';
import { addTaskTypeSaga } from '../../../containers/Shift/saga';

function AddCustomTask({ history, match }) {
  const onGoBackPath = '/add_task/manage_custom_tasks';
  const persistedPaths = [onGoBackPath];

  const handleGoBack = () => {
    history.push(onGoBackPath);
  };

  const onSave = (payload) => {
    addTaskTypeSaga(payload.task_name);
    console.log(payload.task_name);
    history.push(onGoBackPath);
  };

  return (
    <HookFormPersistProvider>
      <PureAddCustomTask
        persistedPaths={persistedPaths}
        handleGoBack={handleGoBack}
        onSave={onSave}
      />
    </HookFormPersistProvider>
  );
}

export default AddCustomTask;
