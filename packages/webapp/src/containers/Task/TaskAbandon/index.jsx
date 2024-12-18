import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import PureAbandonTask from '../../../components/Task/AbandonTask';
import {
  ABANDON_DATE_SELECTED,
  ANOTHER_DUE_DATE,
  ORIGINAL_DUE_DATE,
  TODAY_DUE_DATE,
} from '../../../components/Task/AbandonTask/constants';
import { getDateInputFormat } from '../../../util/moment';
import { taskSelector } from '../../taskSlice';
import { isAdminSelector, loginSelector } from '../../userFarmSlice';
import { abandonTask } from '../saga';

function TaskAbandon({ location }) {
  let navigate = useNavigate();
  const { task_id } = useParams();
  const task = useSelector(taskSelector(task_id));
  const { user_id } = useSelector(loginSelector);
  const isAdmin = useSelector(isAdminSelector);
  const dispatch = useDispatch();

  const backPath = `/tasks/${task_id}/read_only`;

  useEffect(() => {
    // Redirect user to the task's read only view if task is abandoned
    // or if user is worker and not assigned to the task
    if (
      task.abandon_date ||
      (!isAdmin && task.assignee_user_id !== user_id && task.owner_user_id !== user_id)
    ) {
      navigate(-1);
    }
  }, []);

  const onSubmit = (data) => {
    const { no_work_completed, prefer_not_to_say } = data;

    let abandon_date = '';
    switch (data[ABANDON_DATE_SELECTED]) {
      case TODAY_DUE_DATE:
        abandon_date = getDateInputFormat();
        break;
      case ANOTHER_DUE_DATE:
        abandon_date = data.abandon_date;
        break;
      case ORIGINAL_DUE_DATE:
      default:
        abandon_date = getDateInputFormat(task.due_date);
        break;
    }

    let patchData = {
      abandonment_reason: data.reason_for_abandonment.value,
      abandonment_notes: data.abandonment_notes,
      duration: no_work_completed ? null : data.duration,
      happiness: prefer_not_to_say ? null : data.happiness,
      abandon_date,
    };

    if (patchData.abandonment_reason === 'OTHER') {
      patchData.other_abandonment_reason = data.other_abandonment_reason;
    }
    dispatch(
      abandonTask({
        task_id,
        patchData,
        returnPath: location.state ? location.state.pathname : null,
      }),
    );
  };

  const onGoBack = () => {
    navigate(-1);
  };

  const checkIfAssigneeIsLoggedInUser = () =>
    task?.assignee_user_id !== null &&
    typeof task?.assignee_user_id === 'string' &&
    typeof user_id === 'string' &&
    task?.assignee_user_id === user_id;

  return (
    <PureAbandonTask
      onSubmit={onSubmit}
      onGoBack={onGoBack}
      hasAssignee={!!task.assignee_user_id}
      isAssigneeTheLoggedInUser={checkIfAssigneeIsLoggedInUser()}
      originalDueDate={task.due_date}
    />
  );
}

export default TaskAbandon;
