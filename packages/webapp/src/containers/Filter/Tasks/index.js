import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import PureFilterPage from '../../../components/FilterPage';
import { tasksFilterSelector, setTasksFilter } from '../../filterSlice';
import {
  PLANNED,
  COMPLETED,
  FOR_REVIEW,
  ABANDONED,
  LATE,
  STATUS,
} from '../constants';

import { FiFilter } from 'react-icons/all';

const statuses = [ABANDONED, COMPLETED, LATE, PLANNED];

const TasksFilterPage = ({onGoBack}) => {
  const { t } = useTranslation(['translation', 'filter']);
  const tasksFilter = useSelector(tasksFilterSelector);
  const dispatch = useDispatch();

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
        value: status,
        default: tasksFilter[STATUS][status]?.active ?? false,
        label: t(`filter:TASKS.${status}`),
      })),
    },

  ];

  return (
    <PureFilterPage
      title={t('CROP_CATALOGUE.FILTER.TITLE')}
      filters={filters}
      onApply={handleApply}
      filterRef={filterRef}
      onGoBack={onGoBack}
    />
  );
}

export default TasksFilterPage;
