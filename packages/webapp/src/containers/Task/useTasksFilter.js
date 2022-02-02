import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { taskCardContentSelector, getTaskStatus } from './taskCardContentSelector';
import { tasksFilterSelector } from '../filterSlice';
import { STATUS, TYPE } from '../Filter/constants';


const getActiveCriteria = (filter) => {
  const filterKeys = Object.keys(filter);
  const countActive = filterKeys.filter(k => filter[k].active).length;
  let selected = [];

  if (countActive > 0)
    selected = filterKeys.filter(key => filter[key].active);
  else
    selected = filterKeys;

  return new Set( selected )
};

function filterTasks(tasks, filters) {
    const activeStatus = getActiveCriteria(filters[STATUS]);
    const activeTypes = getActiveCriteria(filters[TYPE]);

    return tasks.filter(t => activeStatus.has(t.status))
                .filter(t => activeTypes.has(t.taskType.task_type_id.toString()));
}

export const selectFilteredTasks = createSelector(
  [taskCardContentSelector, tasksFilterSelector],
  filterTasks
);
