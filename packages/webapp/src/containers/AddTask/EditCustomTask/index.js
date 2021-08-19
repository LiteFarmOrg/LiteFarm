import PureEditCustomTask from '../../../components/AddTask/PureEditCustomTask';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function EditCustomTask({ history, match }) {
  const onGoBackPath = '/add_task/manage_custom_tasks';
  const persistedPaths = [onGoBackPath];
  const handleGoBack = () => {
    history.push(onGoBackPath);
  };

  return (
    <HookFormPersistProvider>
      <PureEditCustomTask handleGoBack={handleGoBack} persistedPaths={persistedPaths} />
    </HookFormPersistProvider>
  );
}

export default EditCustomTask;
