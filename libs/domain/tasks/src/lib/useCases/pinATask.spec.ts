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
import { vi, describe, it } from 'vitest';
import { OWNER_ROLE_ID, WORKER_ROLE_ID } from '@litefarm/domain/users';
import { pinATask } from './pinATask';
import { TasksRepository } from '../entities/TasksRepository';
import { Task } from '../entities/Task';

describe('pinATask', () => {
  it('saves pinned state for referenced task', async () => {
    const pinTask = vi.fn(
      async (taskId) =>
        ({
          task_id: taskId,
          pinned: true,
        } as Task)
    );

    const inMemoryTaskRepository: TasksRepository = {
      pinTask,
      unpinTask: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore don’t need all properties
      getOwnUserFarmForTask: async () => ({
        farm_id: 'farm',
        role_id: OWNER_ROLE_ID,
      }),
    };

    const task = await pinATask({ tasksRepository: inMemoryTaskRepository })(
      'user',
      'farm',
      1
    );

    expect(task).toHaveProperty('task_id', 1);
    expect(task).toHaveProperty('pinned', true);
    expect(pinTask).toHaveBeenCalledWith(1, 'user');
  });
  it('throws an AUTHORIZATION ERROR if user is worker in farm', async () => {
    const pinTask = vi.fn(
      async (taskId) =>
        ({
          task_id: taskId,
          pinned: true,
        } as Task)
    );

    const inMemoryTaskRepository: TasksRepository = {
      pinTask,
      unpinTask: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore don’t need all properties
      getOwnUserFarmForTask: async () => ({
        farm_id: 'farm',
        role_id: WORKER_ROLE_ID,
      }),
    };

    await expect(() =>
      pinATask({ tasksRepository: inMemoryTaskRepository })('user', 'farm', 1)
    ).rejects.toThrow('UNAUTHORIZED_ACTION_ERROR');

    expect(pinTask).not.toHaveBeenCalled();
  });
  it('throws an FARM_MISMATCH error if user is not mentionning the task’s farm', async () => {
    const pinTask = vi.fn(
      async (taskId) =>
        ({
          task_id: taskId,
          pinned: true,
        } as Task)
    );

    const inMemoryTaskRepository: TasksRepository = {
      pinTask,
      unpinTask: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore don’t need all properties
      getOwnUserFarmForTask: async () => ({
        farm_id: 'farm',
        role_id: OWNER_ROLE_ID,
      }),
    };

    await expect(() =>
      pinATask({ tasksRepository: inMemoryTaskRepository })(
        'user',
        'otherFarm',
        1
      )
    ).rejects.toThrow('Farm mismatch');

    expect(pinTask).not.toHaveBeenCalled();
  });
});
