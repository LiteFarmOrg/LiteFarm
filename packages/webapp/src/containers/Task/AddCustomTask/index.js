import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureAddCustomTask from '../../../components/Task/PureAddCustomTask';
import { addCustomTaskType } from '../saga';
import { useDispatch } from 'react-redux';

function AddCustomTask({ history, match }) {
  const onGoBackPath = '/add_task/manage_custom_tasks';
  const persistedPaths = [onGoBackPath];

  const dispatch = useDispatch();

  const handleGoBack = () => {
    history.push(onGoBackPath);
  };

  const onSave = (payload) => {
    dispatch(addCustomTaskType(payload));
    history.push(onGoBackPath);
  };

  return (
    <HookFormPersistProvider>
      <PureAddCustomTask
        persistedPaths={persistedPaths}
        handleGoBack={handleGoBack}
        onSave={onSave}
      />
    </HookFormPersistProvider>
  );
}

export default AddCustomTask;
