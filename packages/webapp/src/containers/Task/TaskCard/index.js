import React from 'react';
// import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

// temp
import { taskReducerSelector } from '../../../containers/taskSlice';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureTaskCard from '../../../components/TaskCard';
import { useMemo } from 'react';
import { cropNameByManagementPlanSelector } from '../../managementPlanSlice';
import { getNameFromUserIdSelector } from '../../userFarmSlice';

// current && not selected -> grey 900
// current && selected -> teal 900
// not current && not selected -> teal 900
// not current && selected -> teal 900

const TaskCard = ({ task, onClick, className, style, ...props }) => {
  const { t } = useTranslation();

  const {
    task_id,
    assignee_user_id,
    abandoned_time,
    completed_time,
    // planned_time, aka initial due date
    // for_review_time,
    due_date,
    // coordinates,
    type: taskType,
    locations,
    managementPlans,
  } = task;

  const managementPlanIdToCropNameDict = useSelector(cropNameByManagementPlanSelector);
  const assignee = useSelector(getNameFromUserIdSelector(assignee_user_id));

  const crops = managementPlans.map((mp) => {
    return managementPlanIdToCropNameDict[mp.management_plan_id];
  });

  console.log({ crops });

  let status;
  if (completed_time) status = 'completed';
  else if (abandoned_time) status = 'abandoned';
  else if (new Date(due_date) > Date.now()) status = 'planned';
  else status = 'late';

  return (
    <PureTaskCard
      status={status}
      crops={crops}
      locations={locations}
      dueDate={due_date}
      assignee={assignee}
      style={style}
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

const useGetCropName = (managementPlans) => {
  return managementPlans;
};
