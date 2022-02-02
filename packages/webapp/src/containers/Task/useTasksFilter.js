import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { taskCardContentSelector, getTaskStatus } from './taskCardContentSelector';
import { tasksFilterSelector } from '../filterSlice';
import { STATUS, TYPE, LOCATION, ASSIGNEE, CROP } from '../Filter/constants';


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

const filterByAssignee = ( task, activeAssignees ) => {
  let user_id = 'unassigned';
  if (task.assignee !== undefined) {
    user_id = task.assignee.user_id;
  }
  return activeAssignees.has(user_id)
};

function filterTasks(tasks, filters) {
    const activeStatus = getActiveCriteria(filters[STATUS]);
    const activeTypes = getActiveCriteria(filters[TYPE]);
    const activeLocations = getActiveCriteria(filters[LOCATION]);
    const activeAssignees = getActiveCriteria(filters[ASSIGNEE]);
    const activeVarieties = getActiveCriteria(filters[CROP]);
    console.log(activeVarieties)

    return tasks.filter(t => activeStatus.has(t.status))
                .filter(t => activeTypes.has(t.taskType.task_type_id.toString()))
                .filter(t => activeLocations.has(t.locationName))
                .filter(t => activeVarieties.has(t.cropVarietyName))
                .filter(t => filterByAssignee(t, activeAssignees));
}

export const selectFilteredTasks = createSelector(
  [taskCardContentSelector, tasksFilterSelector],
  filterTasks
);
