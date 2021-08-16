import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureAddCustomTask from '../../../components/AddTask/PureAddCustomTask';

function AddCustomTask({ history, match }) {
  const onGoBackPath = '/add_task/manage_custom_tasks';
  const persistedPaths = [onGoBackPath];

  const handleGoBack = () => {
    history.push(onGoBackPath);
  };

  return (
    <HookFormPersistProvider>
      <PureAddCustomTask persistedPaths={persistedPaths} handleGoBack={handleGoBack} />
    </HookFormPersistProvider>
  );
}

export default AddCustomTask;
