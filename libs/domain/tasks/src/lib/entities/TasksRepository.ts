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
import { User, UserInFarm } from '@litefarm/domain/users';
import { Task } from './Task';

export interface TasksRepository {
  getOwnUserFarmForTask: (
    taskId: Task['task_id'],
    userId: User['user_id']
  ) => Promise<UserInFarm>;
  pinTask: (taskId: Task['task_id'], userId: User['user_id']) => Promise<Task>;
  unpinTask: (
    taskId: Task['task_id'],
    userId: User['user_id']
  ) => Promise<Task>;
}
