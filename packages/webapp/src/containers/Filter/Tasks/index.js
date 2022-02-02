import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import PureFilterPage from '../../../components/FilterPage';
import { tasksFilterSelector, setTasksFilter } from '../../filterSlice';
import { taskCardContentSelector } from '../../Task/taskCardContentSelector';

import {
  PLANNED,
  COMPLETED,
  FOR_REVIEW,
  ABANDONED,
  LATE,
  STATUS,
  TYPE,
  LOCATION
} from '../constants';

import { FiFilter } from 'react-icons/all';


const TasksFilterPage = ({onGoBack}) => {
  // TODO: ask if the tasks types should be included in the filter translation
  const { t } = useTranslation(['translation', 'filter', 'task']);
  const tasksFilter = useSelector(tasksFilterSelector);
  const taskCardContent = useSelector(taskCardContentSelector);
  console.log(taskCardContent)
  const dispatch = useDispatch();

  const statuses = [ABANDONED, COMPLETED, LATE, PLANNED];
  const locations = new Set( taskCardContent.map(t => t.locationName) )

  let taskTypes = {};
  for (const task of taskCardContent) {
    taskTypes[task.taskType.task_type_id] = task.taskType;
  }


  const handleApply = () => {
    dispatch(setTasksFilter(filterRef.current));
    onGoBack?.();
  };
  const filterRef = useRef({});

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
    }
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
}

export default TasksFilterPage;
