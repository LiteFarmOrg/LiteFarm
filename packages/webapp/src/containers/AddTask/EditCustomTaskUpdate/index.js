import PureEditCustomTaskUpdate from '../../../components/AddTask/PureEditCustomTaskUpdate';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function EditCustomTaskUpdate({ history, match }) {
  const onGoBackPath = '/add_task/edit_custom_task';
  const persistedPaths = [onGoBackPath];
  const handleGoBack = () => {
    history.push(onGoBackPath);
  };

  return (
    <HookFormPersistProvider>
      <PureEditCustomTaskUpdate
        handleGoBack={handleGoBack}
        persistedPaths={persistedPaths}
        history={history}
      />
    </HookFormPersistProvider>
  );
}

export default EditCustomTaskUpdate;
