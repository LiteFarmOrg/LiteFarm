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

const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const MOCK_DATA: IrrigationPrescription[] = [
  {
    id: 'uuid_maybe_001',
    some_location_id: '87b5a846-fa97-11ef-a688-ce0b8496eaa9',
    prescription_date: new Date(Date.now() - ONE_HOUR_IN_MS).toDateString(),
    partner_id: 1,
    task_id: 8,
  },
  {
    id: 'uuid_maybe_002',
    some_location_id: '87b5a846-fa97-11ef-a688-ce0b8496eaa9',
    prescription_date: new Date(Date.now() - ONE_HOUR_IN_MS).toDateString(),
    partner_id: 1,
    task_id: 8,
  },
];

export default function useIrrigationPrescriptions(location?: Location) {
  const { data, error, isLoading } = useGetIrrigationPrescriptionsQuery();
  const tasks = useSelector(tasksSelector);

  // TODO: refactor once mocked data is no longer needed
  const irrigationPrescriptions = isLoading ? [] : error || !data ? MOCK_DATA : data;

  let filteredIrrigationPrescriptionsWithTask: LocationIrrigationPrescription[] = [];
  if (location && location.grid_points) {
    filteredIrrigationPrescriptionsWithTask = irrigationPrescriptions
      .filter(
        // return matching plans for this location
        (plan: IrrigationPrescription) => plan.some_location_id === location.location_id,
      )
      .map(({ task_id, ...irrigationPrescription }) => {
        // map the plan to a new object that includes the full task object
        const task = task_id ? tasks.find((t) => t.task_id == task_id) : null;
        return {
          ...irrigationPrescription,
          task: {
            ...task,
            status: getTaskStatus(task),
          },
        };
      });
  }
  return filteredIrrigationPrescriptionsWithTask;
}
