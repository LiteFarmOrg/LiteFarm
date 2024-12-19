import { useNavigate } from 'react-router-dom-v5-compat';
import PureEditCustomTaskUpdate from '../../../components/Task/PureEditCustomTaskUpdate';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function EditCustomTaskUpdate() {
  let navigate = useNavigate();
  const onGoBackPath = '/add_task/edit_custom_task';
  const persistedPaths = [onGoBackPath];
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <HookFormPersistProvider>
      <PureEditCustomTaskUpdate handleGoBack={handleGoBack} persistedPaths={persistedPaths} />
    </HookFormPersistProvider>
  );
}

export default EditCustomTaskUpdate;
