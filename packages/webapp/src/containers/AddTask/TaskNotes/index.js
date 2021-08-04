import PureTaskNotes from '../../../components/AddTask/PureTaskNotes';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TaskNotes({ history, match }) {
  const handleGoBack = () => {
    // todo: need paths from LF-1567 and LF-1568
  };

  const handleCancel = () => {
    console.log('handleCancelled clicked');
    // todo: need main task list page path from Brandon
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
      />
    </HookFormPersistProvider>
  );
}

export default TaskNotes;
