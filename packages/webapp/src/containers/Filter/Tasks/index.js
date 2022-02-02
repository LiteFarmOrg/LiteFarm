import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React, { useRef, useState } from 'react';

import PureFilterPage from '../../../components/FilterPage';
import { tasksFilterSelector, setTasksFilter } from '../../filterSlice';
import { taskCardContentSelector } from '../../Task/taskCardContentSelector';
import Input from '../../../components/Form/Input';


import {
  PLANNED,
  COMPLETED,
  FOR_REVIEW,
  ABANDONED,
  LATE,
  STATUS,
  TYPE,
  LOCATION,
  ASSIGNEE,
  CROP,
  FROM_DATE,
  TO_DATE
} from '../constants';

import { FiFilter } from 'react-icons/all';


const TasksFilterPage = ({onGoBack}) => {
  // TODO: ask if the tasks types should be included in the filter translation
  const { t } = useTranslation(['translation', 'filter', 'task']);
  const tasksFilter = useSelector(tasksFilterSelector);
  const taskCardContent = useSelector(taskCardContentSelector);
  console.log(taskCardContent)
  const dispatch = useDispatch();

  const [fromDate, setFromDate] = useState(tasksFilter[FROM_DATE] ?? '');
  const [toDate, setToDate] = useState(tasksFilter[TO_DATE] ?? '');

  const statuses = [ABANDONED, COMPLETED, LATE, PLANNED];
  const locations = new Set( taskCardContent.map(t => t.locationName) )

  let taskTypes = {};
  let assignees = {};
  for (const task of taskCardContent) {
    taskTypes[task.taskType.task_type_id] = task.taskType;

    if ( task.assignee !== undefined ) {
      const { user_id, first_name, last_name } = task.assignee
      assignees[user_id] = `${first_name} ${last_name}`;
    } else {
      assignees['unassigned'] = t('TASK.UNASSIGNED');
    }
  }

  let cropVarities = new Set( taskCardContent.map(t => t.cropVarietyName) );
  cropVarities.delete(undefined);

  const handleApply = () => {
    const filterToApply = {
      ...filterRef.current,
      FROM_DATE: fromDate ? fromDate : undefined,
      TO_DATE: toDate ? toDate : undefined
    };
    dispatch(setTasksFilter(filterToApply));
    onGoBack?.();
  };
  const filterRef = useRef({});

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value)
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value)
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
    { // TODO: This should be a text search
      subject: t('TASK.FILTER.CROP'),
      filterKey: CROP,
      options: [...cropVarities].map((variety) => ({
        value: variety,
        default: tasksFilter[CROP][variety]?.active ?? false,
        label: variety,
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
      resetters={[
        {
          setFunc: setFromDate,
          defaultVal: '',
        },
        {
          setFunc: setToDate,
          defaultVal: '',
        },
      ]}
    >
      <Input
        label={t('TASK.FILTER.FROM')}
        type={'date'}
        value={fromDate}
        onChange={handleFromDateChange}
      />

      <Input
        label={t('TASK.FILTER.TO')}
        type={'date'}
        value={toDate}
        onChange={handleToDateChange}
      />

    </PureFilterPage>
  );
}

export default TasksFilterPage;
