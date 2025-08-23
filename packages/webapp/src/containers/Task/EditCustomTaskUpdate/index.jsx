import { useHistory } from 'react-router-dom';
import PureEditCustomTaskUpdate from '../../../components/Task/PureEditCustomTaskUpdate';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function EditCustomTaskUpdate() {
  const history = useHistory();
  const onGoBackPath = '/add_task/edit_custom_task';
  const persistedPaths = [onGoBackPath];
  const handleGoBack = () => {
    history.back();
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
