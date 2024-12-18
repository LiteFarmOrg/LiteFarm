import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureAddCustomTask from '../../../components/Task/PureAddCustomTask';
import { addCustomTaskType } from '../saga';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function AddCustomTask() {
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoBack = () => {
    navigate(-1);
  };

  const onSave = (payload) => {
    dispatch(addCustomTaskType(payload));
    navigate(-1);
  };

  return (
    <HookFormPersistProvider>
      <PureAddCustomTask handleGoBack={handleGoBack} onSave={onSave} />
    </HookFormPersistProvider>
  );
}

export default AddCustomTask;
