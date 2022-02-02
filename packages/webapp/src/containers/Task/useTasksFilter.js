import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { taskCardContentSelector, getTaskStatus } from './taskCardContentSelector';
import { tasksFilterSelector } from '../filterSlice';
import { STATUS, TYPE, LOCATION } from '../Filter/constants';


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
    const activeLocations = getActiveCriteria(filters[LOCATION]);
    // console.log(activeLocations);

    return tasks.filter(t => activeStatus.has(t.status))
                .filter(t => activeTypes.has(t.taskType.task_type_id.toString()))
                .filter(t => activeLocations.has(t.locationName));
}

export const selectFilteredTasks = createSelector(
  [taskCardContentSelector, tasksFilterSelector],
  filterTasks
);
