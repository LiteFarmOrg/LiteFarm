import moment from 'moment';

import { getTaskStatus } from './taskCardContentSelector';
import { ASSIGNEE, CROP, FROM_DATE, LOCATION, STATUS, TO_DATE, TYPE } from '../Filter/constants';

const getActiveCriteria = (filter) => {
  const filterKeys = Object.keys(filter);
  const countActive = filterKeys.filter((k) => filter[k].active).length;
  let selected = [];

  if (countActive > 0) selected = filterKeys.filter((key) => filter[key].active);
  else selected = filterKeys;

  return new Set(selected);
};

const filterByAssignee = (task, activeAssignees) => {
  let user_id = 'unassigned';
  if (task.assignee !== undefined) {
    user_id = task.assignee.user_id;
  }
  return activeAssignees.has(user_id);
};

const filterByFromDate = (task, fromDate) => {
  if (fromDate === undefined) {
    return true;
  }

  return moment(task.complete_date || task.due_date).isSameOrAfter(fromDate, 'day');
};

const filterByToDate = (task, toDate) => {
  if (toDate === undefined) {
    return true;
  }

  return moment(task.complete_date || task.due_date).isSameOrBefore(toDate, 'day');
};

export function filterTasks(tasks, filters) {
  const activeStatus = getActiveCriteria(filters[STATUS]);
  const activeTypes = getActiveCriteria(filters[TYPE]);
  const activeLocations = getActiveCriteria(filters[LOCATION]);
  const activeAssignees = getActiveCriteria(filters[ASSIGNEE]);
  const activeVarieties = getActiveCriteria(filters[CROP]);
  return tasks
    .filter((t) => !activeStatus.size || activeStatus.has(getTaskStatus(t)))
    .filter((t) => !activeTypes.size || activeTypes.has(t.taskType.task_type_id.toString()))
    .filter(
      (t) =>
        !activeLocations.size ||
        t.locations.find(({ location_id }) => activeLocations.has(location_id)) ||
        !t.locations.length
    )
    .filter(
      (t) =>
        !Object.values(filters[CROP]).find(({ active }) => active) ||
        t.managementPlans.find(({ crop_variety_id }) => activeVarieties.has(crop_variety_id)),
    )
    .filter((t) => !activeAssignees.size || filterByAssignee(t, activeAssignees))
    .filter((t) => filterByFromDate(t, filters[FROM_DATE]))
    .filter((t) => filterByToDate(t, filters[TO_DATE]));
}
