import { useHistory } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PureEditCustomTaskUpdate from '../../../components/Task/PureEditCustomTaskUpdate';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function EditCustomTaskUpdate() {
  const history = useHistory();
  const navigate = useNavigate();
  const onGoBackPath = '/add_task/edit_custom_task';
  const persistedPaths = [onGoBackPath];
  const handleGoBack = () => {
    navigate(-1);
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
