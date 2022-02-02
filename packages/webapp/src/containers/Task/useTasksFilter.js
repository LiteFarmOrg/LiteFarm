import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { taskCardContentSelector, getTaskStatus } from './taskCardContentSelector';
import { tasksFilterSelector } from '../filterSlice';
import { STATUS } from '../Filter/constants';


const getActiveCriteria = (filter) => {
  const filterKeys = Object.keys(filter);
  const countActive = filterKeys.filter(k => filter[k].active).length;
  let selected = [];

  if (countActive > 0)
    selected = filterKeys.filter(key => filter[key].active);
  else
    selected = filterKeys;

  return new Set( selected.map(i => i.toLowerCase()))
};

function filterTasks(tasks, filters) {
    const activeStatus = getActiveCriteria(filters[STATUS]);

    return tasks.filter(t => activeStatus.has(t.status));
}

export const selectFilteredTasks = createSelector(
  [taskCardContentSelector, tasksFilterSelector],
  filterTasks
);
