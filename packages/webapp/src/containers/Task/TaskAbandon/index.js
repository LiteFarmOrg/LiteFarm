import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureAbandonTask from '../../../components/Task/AbandonTask';
import { taskSelectorById } from '../../taskSlice';
import { abandonTask } from '../saga';

function TaskAbandon({ history, match }) {
  const { task_id } = match.params;
  const task = useSelector(taskSelectorById(task_id));
  const dispatch = useDispatch();

  const backPath = `/tasks/${task_id}/read_only`;

  useEffect(() => {
    // Redirect user to the task's read only view if task is abandoned
    if (task.abandoned_time) history.push(backPath);
  }, []);

  const onSubmit = (data) => {
    let patchData = {
      abandonment_reason: data.reason_for_abandonment.value,
      abandonment_notes: data.abandonment_notes,
    };
    if (patchData.abandonment_reason === 'OTHER') {
      patchData.other_reason_for_abandonment = data.other_reason_for_abandonment;
    }
    dispatch(abandonTask({ task_id, patchData }));
  };

  const onGoBack = () => {
    history.push(backPath);
  };

  return <PureAbandonTask onSubmit={onSubmit} onGoBack={onGoBack} />;
}

export default TaskAbandon;
