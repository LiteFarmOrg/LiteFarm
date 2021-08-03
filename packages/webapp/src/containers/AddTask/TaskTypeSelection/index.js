import PureTaskTypeSelection from '../../../components/AddTask/PureTaskTypeSelection';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TaskTypeSelection({ history, match }) {
  const userFarm = useSelector(userFarmSelector);

  const onCustomTask = () => {
    console.log('Go to LF-1747 custom task creation page');
  };

  const onContinue = () => {
    history.push(`/tasks/add_task/task_date`);
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleCancel = () => {
    console.log('cancel called');
  };

  return (
    <HookFormPersistProvider>
      <PureTaskTypeSelection
        history={history}
        onCustomTask={onCustomTask}
        handleCancel={handleCancel}
        handleGoBack={handleGoBack}
        persistedPaths={[`/tasks/add_task/task_date`]}
        onContinue={onContinue}
      />
    </HookFormPersistProvider>
  );
}

export default TaskTypeSelection;
