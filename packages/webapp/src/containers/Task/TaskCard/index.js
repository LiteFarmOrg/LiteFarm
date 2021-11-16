import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { userFarmsByFarmSelector, userFarmSelector } from '../../userFarmSlice';
import { PureTaskCard } from '../../../components/CardWithStatus/TaskCard/TaskCard';
import TaskQuickAssignModal from '../../../components/Modals/QuickAssignModal';
import { assignTask, assignTasksOnDate } from '../saga';

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
  ...props
}) => {
  const [showTaskAssignModal, setShowTaskAssignModal] = useState();
  const dispatch = useDispatch();
  const onAssignTasksOnDate = (task) => dispatch(assignTasksOnDate(task));
  const onAssignTask = (task) => dispatch(assignTask(task));
  const users = useSelector(userFarmsByFarmSelector);
  const user = useSelector(userFarmSelector);
  const immutableStatus = ['completed', 'abandoned'];

  return (
    <>
      <PureTaskCard
        taskType={taskType}
        status={status}
        locationName={locationName}
        cropVarietyName={cropVarietyName}
        completeOrDueDate={completeOrDueDate}
        assignee={assignee}
        style={style}
        onClick={onClick}
        onClickAssignee={() => {
          if (!immutableStatus.includes(status)) {
            setShowTaskAssignModal(true);
          }
        }}
        selected={selected}
        happiness={happiness}
        classes={classes}
      />
      {showTaskAssignModal && (
        <TaskQuickAssignModal
          task_id={task_id}
          due_date={completeOrDueDate}
          isAssigned={!!assignee}
          onAssignTasksOnDate={onAssignTasksOnDate}
          onAssignTask={onAssignTask}
          users={users}
          user={user}
          dismissModal={() => setShowTaskAssignModal(false)}
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
  selected: PropTypes.bool,
  task_id: PropTypes.number,
};

export default TaskCard;
