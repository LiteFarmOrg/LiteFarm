import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useRef } from 'react';

import PureFilterPage from '../../../components/FilterPage';
import { setTasksFilter, tasksFilterSelector } from '../../filterSlice';

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
import { tasksSelector } from '../../taskSlice';
import { locationsSelector } from '../../locationSlice';
import { userFarmsByFarmSelector } from '../../userFarmSlice';

const TasksFilterPage = ({ onGoBack }) => {
  const { t } = useTranslation(['translation', 'filter', 'task']);
  const tasksFilter = useSelector(tasksFilterSelector);
  const tasks = useSelector(tasksSelector);
  const allActiveNonOwners = useSelector(userFarmsByFarmSelector)
    .filter((assignee) => assignee.role != 'Owner')
    .filter((assignee) => assignee.status != 'Inactive');

  const dispatch = useDispatch();
  const locations = useSelector(locationsSelector);

  const statuses = [ABANDONED, COMPLETED, LATE, PLANNED];

  const { taskTypes, assignees } = useMemo(() => {
    let taskTypes = {};
    let assignees = {};
    for (const task of tasks) {
      taskTypes[task.taskType.task_type_id] = task.taskType;
      if (task.assignee !== undefined) {
        const { user_id, first_name, last_name } = task.assignee;
        assignees[user_id] = `${first_name} ${last_name}`;
      }
    }
    for (const user of allActiveNonOwners) {
      assignees[user['user_id']] = `${user['first_name']} ${user['last_name']}`;
    }
    return { taskTypes, assignees };
  }, [tasks.length]);

  const cropVarietyEntities = useMemo(() => {
    return tasks.reduce((cropVarietyEntities, { managementPlans }) => {
      for (const managementPlan of managementPlans) {
        const cropVariety = managementPlan.crop_variety;
        const crop = cropVariety.crop;
        const cropName = t(`crop:${crop.crop_translation_key}`);
        cropVarietyEntities[cropVariety.crop_variety_id] = cropVariety.crop_variety_name
          ? `${cropVariety.crop_variety_name}, ${cropName}`
          : cropName;
      }
      return cropVarietyEntities;
    }, {});
  }, [tasks.length]);

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
      type: SEARCHABLE_MULTI_SELECT,
      options: Object.values(taskTypes).map((type) => ({
        value: type.task_type_id,
        default: tasksFilter[TYPE][type.task_type_id]?.active ?? false,
        label: t(`task:${type.task_translation_key}`),
      })),
    },
    {
      subject: t('TASK.FILTER.LOCATION'),
      filterKey: LOCATION,
      type: SEARCHABLE_MULTI_SELECT,
      options: locations.map(({ location_id, name }) => ({
        value: location_id,
        default: tasksFilter[LOCATION][location_id]?.active ?? false,
        label: name,
      })),
    },
    {
      subject: t('TASK.FILTER.ASSIGNEE'),
      filterKey: ASSIGNEE,
      type: SEARCHABLE_MULTI_SELECT,
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
      options: Object.entries(cropVarietyEntities).map(([crop_variety_id, name]) => ({
        value: crop_variety_id,
        default: tasksFilter[CROP][crop_variety_id]?.active ?? false,
        label: name,
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
