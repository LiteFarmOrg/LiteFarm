import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useRef } from 'react';

import PureFilterPage from '../../../components/FilterPage';
import { setTasksFilter, tasksFilterSelector } from '../../filterSlice';
import { taskCardContentSelector } from '../../Task/taskCardContentSelector';

import {
  ABANDONED,
  ASSIGNEE,
  COMPLETED,
  CROP,
  FROM_DATE,
  LATE,
  LOCATION,
  PLANNED,
  STATUS,
  TO_DATE,
  TYPE,
} from '../constants';

import { DATE_RANGE, SEARCHABLE_MULTI_SELECT } from '../../../components/Filter/filterTypes';
import { getSupportedTaskTypesSet } from '../../../components/Task/getSupportedTaskTypesSet';

const TasksFilterPage = ({ onGoBack }) => {
  const { t } = useTranslation(['translation', 'filter', 'task']);
  const tasksFilter = useSelector(tasksFilterSelector);
  const taskCardContent = useSelector(taskCardContentSelector);
  const dispatch = useDispatch();

  const statuses = [ABANDONED, COMPLETED, LATE, PLANNED];
  const locations = new Set(taskCardContent.map((t) => t.locationName));

  const { taskTypes, assignees } = useMemo(() => {
    let taskTypes = {};
    let assignees = {};
    const supportedTaskTypes = getSupportedTaskTypesSet(true);
    for (const task of taskCardContent) {
      if (task.taskType.farm_id || supportedTaskTypes.has(task.taskType.task_translation_key)) {
        taskTypes[task.taskType.task_type_id] = task.taskType;
      }
      if (task.assignee !== undefined) {
        const { user_id, first_name, last_name } = task.assignee;
        assignees[user_id] = `${first_name} ${last_name}`;
      } else {
        assignees['unassigned'] = t('TASK.UNASSIGNED');
      }
    }
    return { taskTypes, assignees };
  }, [taskCardContent.length]);

  let cropVarities = new Set(taskCardContent.map((t) => t.cropVarietyName));
  cropVarities.delete(undefined);
  const filterRef = useRef({});

  const handleApply = () => {
    dispatch(setTasksFilter(filterRef.current));
    onGoBack?.();
  };

  const filters = [
    {
      subject: t('TASK.FILTER.STATUS'),
      filterKey: STATUS,
      options: statuses.map((status) => ({
        value: status.toLowerCase(),
        default: tasksFilter[STATUS][status.toLowerCase()]?.active ?? false,
        label: t(`filter:TASK.${status}`),
      })),
    },
    {
      subject: t('TASK.FILTER.TYPE'),
      filterKey: TYPE,
      options: Object.values(taskTypes).map((type) => ({
        value: type.task_type_id,
        default: tasksFilter[TYPE][type.task_type_id]?.active ?? false,
        label: t(`task:${type.task_translation_key}`),
      })),
    },
    {
      subject: t('TASK.FILTER.LOCATION'),
      filterKey: LOCATION,
      options: [...locations].map((location) => ({
        value: location,
        default: tasksFilter[LOCATION][location]?.active ?? false,
        label: location,
      })),
    },
    {
      subject: t('TASK.FILTER.ASSIGNEE'),
      filterKey: ASSIGNEE,
      options: Object.keys(assignees).map((user_id) => ({
        value: user_id,
        default: tasksFilter[ASSIGNEE][user_id]?.active ?? false,
        label: assignees[user_id],
      })),
    },
    {
      subject: t('TASK.FILTER.CROP'),
      filterKey: CROP,
      type: SEARCHABLE_MULTI_SELECT,
      options: [...cropVarities].map((variety) => ({
        value: variety,
        default: tasksFilter[CROP][variety]?.active ?? false,
        label: variety,
      })),
    },
    {
      subject: t('TASK.FILTER.DATE_RANGE'),
      type: DATE_RANGE,
      defaultFromDate: tasksFilter[FROM_DATE],
      defaultToDate: tasksFilter[TO_DATE],
    },
  ];

  return (
    <PureFilterPage
      title={t('TASK.FILTER.TITLE')}
      filters={filters}
      onApply={handleApply}
      filterRef={filterRef}
      onGoBack={onGoBack}
    />
  );
};

export default TasksFilterPage;
