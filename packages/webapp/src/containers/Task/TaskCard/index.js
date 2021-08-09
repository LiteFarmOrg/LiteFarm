import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureTaskCard from '../../../components/TaskCard';
import { cropTranslationKeyByManagementPlanSelector } from '../../managementPlanSlice';
import { getNameFromUserIdSelector } from '../../userFarmSlice';

const TaskCard = ({ task, onClick, className, style, onClickAssignee, ...props }) => {
  const { t } = useTranslation();

  const {
    task_id,
    assignee_user_id,
    abandoned_time,
    completed_time,
    // planned_time, aka initial due date
    // for_review_time,
    due_date,
    // coordinates, (TODO: for pin drop)
    taskType: taskTypeArr,
    locations,
    managementPlans,
    happiness,
  } = task;
  const [taskType] = taskTypeArr;

  const managementPlanIdToCropTranslationKeyDict = useSelector(
    cropTranslationKeyByManagementPlanSelector,
  );
  const assignee = useSelector(getNameFromUserIdSelector(assignee_user_id));

  const crops = managementPlans.map((mp) => {
    return managementPlanIdToCropTranslationKeyDict[mp.management_plan_id];
  });

  const handleClickAssignee = (e) => {
    e.stopPropagation();
    onClickAssignee(task_id, due_date, !!assignee);
  };

  let status;
  if (completed_time) status = 'completed';
  else if (abandoned_time) status = 'abandoned';
  else if (new Date(due_date) > Date.now()) status = 'planned';
  else status = 'late';

  return (
    <PureTaskCard
      taskType={taskType}
      status={status}
      crops={crops}
      locations={locations}
      dueDate={due_date}
      assignee={assignee}
      style={style}
      happiness={happiness}
      onClickAssignee={handleClickAssignee}
    />
  );
};

TaskCard.propTypes = {
  color: PropTypes.oneOf(['secondary', 'active', 'disabled']),
  onClick: PropTypes.func,
  ownerName: PropTypes.string,
  farmName: PropTypes.string,
  address: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object,
};

export default TaskCard;
