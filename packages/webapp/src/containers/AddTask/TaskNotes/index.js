import PureTaskNotes from '../../../components/AddTask/PureTaskNotes';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TaskNotes({ history, match }) {
  const continuePath = '/add_task/task_assignment';
  const goBackPath = '/add_task/task_locations';

  const persistedPaths = [goBackPath, continuePath];
  const handleGoBack = () => {
    history.push('/add_task/task_locations');
  };

  const handleCancel = () => {
    history.push('/tasks')
  };

  const onSubmit = () => {
    history.push('/add_task/task_assignment');
  };

  const onError = () => {};

  return (
    <HookFormPersistProvider>
      <PureTaskNotes
        handleCancel={handleCancel}
        handleGoBack={handleGoBack}
        onError={onError}
        onSubmit={onSubmit}
        persistedPaths={persistedPaths}
      />
    </HookFormPersistProvider>
  );
}

export default TaskNotes;
