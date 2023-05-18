import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { userFarmsByFarmSelector, userFarmSelector } from '../../userFarmSlice';
import { PureTaskCard } from '../../../components/CardWithStatus/TaskCard/TaskCard';
import TaskQuickAssignModal from '../../../components/Modals/QuickAssignModal';
import UpdateTaskDateModal from '../../../components/Modals/UpdateTaskDateModal';
import {
  assignTask,
  assignTasksOnDate,
  changeTaskDate,
  changeTaskWage,
  updateUserFarmWage,
  setUserFarmWageDoNotAskAgain,
  pinTask,
  unpinTask,
} from '../saga';

const TaskCard = ({
  task_id,
  taskType,
  status,
  locationName,
  cropVarietyName,
  completeOrDueDate,
  assignee = null,
  style,
  onClick = null,
  selected,
  happiness,
  classes = { card: {} },
  wage_at_moment,
  pinned,
  ...props
}) => {
  const [showTaskAssignModal, setShowTaskAssignModal] = useState();
  const [showDateAssignModal, setShowDateAssignModal] = useState();
  const dispatch = useDispatch();
  const onChangeTaskDate = (date) => {
    dispatch(changeTaskDate({ task_id, due_date: date + 'T00:00:00.000' }));
  };
  const onAssignTasksOnDate = (task) => dispatch(assignTasksOnDate(task));
  const onAssignTask = (task) => dispatch(assignTask(task));
  const onUpdateUserFarmWage = (user) => dispatch(updateUserFarmWage(user));
  const onSetUserFarmWageDoNotAskAgain = (user) => {
    dispatch(setUserFarmWageDoNotAskAgain(user));
  };
  const onChangeTaskWage = (wage) => {
    dispatch(changeTaskWage({ task_id, wage_at_moment: wage }));
  };
  const users = useSelector(userFarmsByFarmSelector).filter((user) => user.status !== 'Inactive');
  const user = useSelector(userFarmSelector);
  const immutableStatus = ['completed', 'abandoned'];
  let isAssignee = false;
  let isAdmin = false;
  let taskUnassigned = false;

  if (user) {
    isAdmin = user.is_admin;
  }
  if (assignee) {
    isAssignee = user.user_id === assignee.user_id;
  } else {
    taskUnassigned = true;
  }

  // We put this in its own variable in case the condition for "pinnability" were to change.
  // For now, only admins (roles 1, 2, 5; i.e.: Owners, Managers, Extension officers) can pin/unpin.
  const canPin = isAdmin;

  // This will handle pinning
  // Note: this does not take concurrent pinnings/un-pinnings into account.
  // TODO-ish: maybe improve condition?  To discuss/think about.
  const handlePin = () => {
    if (pinned) {
      dispatch(unpinTask({ task_id }));
    } else {
      dispatch(pinTask({ task_id }));
    }
  };

  return (
    <>
      <PureTaskCard
        taskType={taskType}
        status={status}
        locationName={locationName}
        cropVarietyName={cropVarietyName}
        completeOrDueDate={completeOrDueDate}
        abandonDate={props['abandon_date']}
        assignee={assignee}
        style={style}
        onClick={onClick}
        onClickAssignee={() => {
          if (!immutableStatus.includes(status) && (isAssignee || isAdmin || taskUnassigned)) {
            setShowTaskAssignModal(true);
          }
        }}
        onClickCompleteOrDueDate={() => {
          if (!immutableStatus.includes(status) && isAdmin) {
            setShowDateAssignModal(true);
          }
        }}
        selected={selected}
        happiness={happiness}
        classes={classes}
        isAdmin={isAdmin}
        isAssignee={isAssignee}
        task_id={task_id}
        pinned={pinned}
        pinnable={canPin}
        handlePin={handlePin}
      />
      {showTaskAssignModal && (
        <TaskQuickAssignModal
          task_id={task_id}
          due_date={completeOrDueDate}
          isAssigned={!!assignee}
          onAssignTasksOnDate={onAssignTasksOnDate}
          onAssignTask={onAssignTask}
          onUpdateUserFarmWage={onUpdateUserFarmWage}
          onChangeTaskWage={onChangeTaskWage}
          onSetUserFarmWageDoNotAskAgain={onSetUserFarmWageDoNotAskAgain}
          users={users}
          user={user}
          dismissModal={() => setShowTaskAssignModal(false)}
          wage_at_moment={wage_at_moment}
        />
      )}
      {showDateAssignModal && (
        <UpdateTaskDateModal
          due_date={completeOrDueDate}
          onChangeTaskDate={onChangeTaskDate}
          dismissModal={() => setShowDateAssignModal(false)}
        />
      )}
    </>
  );
};

TaskCard.propTypes = {
  style: PropTypes.object,
  status: PropTypes.oneOf(['late', 'planned', 'completed', 'abandoned', 'forReview']),
  classes: PropTypes.shape({ container: PropTypes.object, card: PropTypes.object }),
  onClick: PropTypes.func,
  happiness: PropTypes.oneOf([1, 2, 3, 4, 5, 0, null]),
  locationName: PropTypes.string,
  taskType: PropTypes.object,
  cropVarietyName: PropTypes.string,
  completeOrDueDate: PropTypes.string,
  assignee: PropTypes.object,
  onClickAssignee: PropTypes.func,
  onClickCompleteOrDueDate: PropTypes.func,
  selected: PropTypes.bool,
  task_id: PropTypes.number,
  pinned: PropTypes.bool,
};

export default TaskCard;
