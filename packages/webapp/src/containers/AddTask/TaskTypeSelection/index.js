import PureTaskTypeSelection from '../../../components/AddTask/PureTaskTypeSelection';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';

function TaskTypeSelection({ history, match }) {
  const userFarm = useSelector(userFarmSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);

  const onCustomTask = () => {
    console.log('Go to LF-1747 custom task creation page');
  };

  const onContinue = () => {
    history.push('/tasks/:management_plan_id/add_task/task_date');
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
        persistedPaths={[]}
        onContinue={onContinue}
        persistedFormData={persistedFormData}
      />
    </HookFormPersistProvider>
  );
}

export default TaskTypeSelection;
