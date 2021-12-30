import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureAddCustomTask from '../../../components/Task/PureAddCustomTask';
import { addCustomTaskType } from '../saga';
import { useDispatch } from 'react-redux';

function AddCustomTask({ history, match }) {


  const dispatch = useDispatch();

  const handleGoBack = () => {
    history.goBack();
  };

  const onSave = (payload) => {
    dispatch(addCustomTaskType(payload));
    history.goBack();
  };

  return (
    <HookFormPersistProvider>
      <PureAddCustomTask
        handleGoBack={handleGoBack}
        onSave={onSave}
      />
    </HookFormPersistProvider>
  );
}

export default AddCustomTask;
