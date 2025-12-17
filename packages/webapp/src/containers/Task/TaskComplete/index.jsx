import { useHistory, useLocation, useParams } from 'react-router-dom';
import PureTaskComplete from '../../../components/Task/TaskComplete';
import { useDispatch } from 'react-redux';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { completeTask } from '../saga';

function TaskComplete() {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { task_id } = useParams();
  const persistedPaths = [`/tasks/${task_id}/before_complete`, `/tasks/${task_id}/harvest_uses`];

  const returnPath = location?.state?.pathname ?? null;

  const onSave = (data) => {
    dispatch(completeTask({ task_id, data, returnPath }));
  };

  const onGoBack = () => {
    history.back();
  };

  return (
    <HookFormPersistProvider>
      <PureTaskComplete onSave={onSave} onGoBack={onGoBack} persistedPaths={persistedPaths} />
    </HookFormPersistProvider>
  );
}

export default TaskComplete;
