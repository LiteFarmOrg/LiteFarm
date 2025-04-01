/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useSelector } from 'react-redux';
import {
  getTaskStatus,
  manualFilteredTaskCardContentSelector,
} from '../../Task/taskCardContentSelector';
import { useMemo } from 'react';

export default function useLocationTasks(location_id) {
  const filter = (taskList) => {
    const activeStatus = ['planned', 'late'];
    return taskList.filter(
      (t) =>
        t.locations.find((loc) => loc.location_id === location_id) &&
        activeStatus.includes(getTaskStatus(t)),
    );
  };

  const locationTasks = useSelector(manualFilteredTaskCardContentSelector(filter));

  return useMemo(() => {
    return locationTasks.reduce(
      (previous, current) => {
        previous.count++;
        if (!Object.keys(previous.tasks).includes(current.date)) {
          previous.tasks[current.date] = [current];
        } else {
          previous.tasks[current.date].push(current);
        }
        return previous;
      },
      { count: 0, tasks: {} },
    );
  }, [locationTasks]);
}
