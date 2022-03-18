import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useRef, useState } from 'react';

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
import Switch from '../../../components/Form/Switch';
import DateRangePicker from '../../../components/Form/DateRangePicker';
import { getDateInputFormat } from '../../../util/moment';

const TasksFilterPage = ({ onGoBack }) => {
  // TODO: ask if the tasks types should be included in the filter translation
  const { t } = useTranslation(['translation', 'filter', 'task']);
  const tasksFilter = useSelector(tasksFilterSelector);
  const taskCardContent = useSelector(taskCardContentSelector);
  const dispatch = useDispatch();

  const [showDateFilter, setShowDateFilter] = useState(
    !!(tasksFilter[FROM_DATE] || tasksFilter[TO_DATE]),
  );
  const onSwitchClick = () => {
    if (showDateFilter) {
      setShowDateFilter(false);
      setFromDate('');
      setToDate('');
    } else {
      setShowDateFilter(true);
      setFromDate(tasksFilter[FROM_DATE] || getDateInputFormat());
      setToDate(() => {
        if (tasksFilter[TO_DATE]) return tasksFilter[TO_DATE];
        const defaultToDate = new Date();
        defaultToDate.setDate(defaultToDate.getDate() + 7);
        return getDateInputFormat(defaultToDate);
      });
    }
  };
  const [fromDate, setFromDate] = useState(tasksFilter[FROM_DATE] ?? '');
  const [toDate, setToDate] = useState(tasksFilter[TO_DATE] ?? '');

  const statuses = [ABANDONED, COMPLETED, LATE, PLANNED];
  const locations = new Set(taskCardContent.map((t) => t.locationName));

  const { taskTypes, assignees } = useMemo(() => {
    let taskTypes = {};
    let assignees = {};
    for (const task of taskCardContent) {
      taskTypes[task.taskType.task_type_id] = task.taskType;

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

  const handleApply = () => {
    const filterToApply = {
      ...filterRef.current,
      FROM_DATE: fromDate ? fromDate : undefined,
      TO_DATE: toDate ? toDate : undefined,
    };
    dispatch(setTasksFilter(filterToApply));
    onGoBack?.();
  };
  const filterRef = useRef({});

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
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
      // TODO: This should be a text search
      subject: t('TASK.FILTER.CROP'),
      filterKey: CROP,
      options: [...cropVarities].map((variety) => ({
        value: variety,
        default: tasksFilter[CROP][variety]?.active ?? false,
        label: variety,
      })),
    },
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
      <Switch
        label={t('TASK.FILTER.DATE_RANGE')}
        style={{ marginBottom: '24px' }}
        checked={showDateFilter}
        onChange={onSwitchClick}
      />
      {showDateFilter && (
        <>
          <DateRangePicker
            fromProps={{
              value: fromDate,
              onChange: handleFromDateChange,
            }}
            toProps={{
              value: toDate,
              onChange: handleToDateChange,
            }}
          />
        </>
      )}
    </PureFilterPage>
  );
};

export default TasksFilterPage;
