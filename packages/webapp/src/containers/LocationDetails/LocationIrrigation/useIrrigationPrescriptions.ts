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

import { useGetIrrigationPrescriptionsQuery } from '../../../store/api/apiSlice';
import { Location, Task } from '../../../types';
import { IrrigationPrescription } from '../../../store/api/types';
import { useSelector } from 'react-redux';
import { tasksSelector } from '../../taskSlice';
import { getTaskStatus } from '../../Task/taskCardContentSelector';

interface LocationIrrigationPrescription extends IrrigationPrescription {
  task?: Task;
}

export default function useIrrigationPrescriptions(location?: Location) {
  if (!location) {
    return [];
  }

  const today = new Date().toISOString().split('T')[0];

  const { prescriptionList = [] } = useGetIrrigationPrescriptionsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      prescriptionList: data?.filter(
        (prescription) => prescription.recommended_start_date >= today,
      ),
    }),
  });
  const tasks = useSelector(tasksSelector);

  let filteredIrrigationPrescriptionsWithTask: LocationIrrigationPrescription[] = [];
  if (location.grid_points) {
    filteredIrrigationPrescriptionsWithTask = prescriptionList
      .filter(
        // return matching plans for this location
        ({ location_id }) => location_id === location.location_id,
      )
      .map(({ task_id, ...irrigationPrescription }) => {
        // map the plan to a new object that includes select task properties
        const task = task_id ? tasks.find((t) => t.task_id == task_id) : null;
        return {
          ...irrigationPrescription,
          task: task
            ? {
                task_id: task.task_id,
                status: getTaskStatus(task),
              }
            : undefined,
        };
      });
  }
  return filteredIrrigationPrescriptionsWithTask;
}
