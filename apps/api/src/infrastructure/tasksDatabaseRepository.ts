/*
 *  Copyright 2023 LiteFarm.org
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore until migrated to TypeScript
import TaskModel from '../models/taskModel';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore until migrated to TypeScript
import knex from '../util/knex';
import { Task, TasksRepository } from '@litefarm/domain/tasks';
import { UserInFarm } from '@litefarm/domain/users';
import { RepositoryError } from '@litefarm/domain/errors';

export const tasksDatabaseRepository: TasksRepository = {
  pinTask: async (taskId, userId): Promise<Task> => {
    return await handleRepositoryError(
      () => TaskModel.pinTask(taskId, userId),
      'CANNOT_UPDATE_TASK'
    );
  },
  unpinTask: async (taskId, userId): Promise<Task> => {
    return await handleRepositoryError(
      () => TaskModel.unpinTask(taskId, userId),
      'CANNOT_UPDATE_TASK'
    );
  },
  getOwnUserFarmForTask: async (taskId, userId): Promise<UserInFarm> => {
    return await handleRepositoryError(
      async () =>
        (await knex({ uF: 'userFarm' })
          .leftJoin('location', 'userFarm.farm_id', 'location.farm_id')
          .leftJoin(
            'location_tasks',
            'location_tasks.location_id',
            'location.location_id'
          )
          .where('location_tasks.task_id', taskId)
          .andWhere('uf.user_id', userId)
          .first()) as UserInFarm,
      'CANNOT_FETCH_USER_FARM'
    );
  },
};

const handleRepositoryError = async <T>(
  fn: () => Promise<T>,
  errorMessage = 'CANNOT_UPDATE_TASK'
) => {
  try {
    return await fn();
  } catch (e) {
    throw new RepositoryError(errorMessage, e);
  }
};
