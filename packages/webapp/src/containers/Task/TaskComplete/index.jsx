import PureTaskComplete from '../../../components/Task/TaskComplete';
import { useDispatch } from 'react-redux';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { completeTask } from '../saga';
import { useNavigate, useParams } from 'react-router';

function TaskComplete({ location }) {
  let navigate = useNavigate();
  let { task_id } = useParams();
  const dispatch = useDispatch();
  const persistedPaths = [`/tasks/${task_id}/before_complete`, `/tasks/${task_id}/harvest_uses`];

  const returnPath = location?.state?.pathname ?? null;

  const onSave = (data) => {
    dispatch(completeTask({ task_id, data, returnPath }));
  };

  const onGoBack = () => {
    navigate(-1);
  };

  return (
    <HookFormPersistProvider>
      <PureTaskComplete onSave={onSave} onGoBack={onGoBack} persistedPaths={persistedPaths} />
    </HookFormPersistProvider>
  );
}

export default TaskComplete;
