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

const TaskCard = ({ color = 'secondary', task, onClick, className, style, ...props }) => {
  const { t } = useTranslation();

  const {
    task_id,
    assignee_user_id,
    abandoned_time,
    completed_time,
    late_time,
    planned_time,
    for_review_time,
    due_date,
    // coordinates,
    type: taskType,
    locations,
    managementPlans,
  } = task;

  const managementPlanIdToCropNameDict = useSelector(cropNameByManagementPlanSelector);
  const { first_name, last_name } = useSelector(getNameFromUserIdSelector('104942873090979111002'));

  // console.log({task});
  // console.log({first_name, last_name});

  const crops = managementPlans.map((mp) => {
    return managementPlanIdToCropNameDict[mp.management_plan_id];
  });

  // console.log({crops});

  return (
    <PureTaskCard
      crops={crops}
      locations={locations}
      dueDate={due_date}
      assignee={{ first_name, last_name }}
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
