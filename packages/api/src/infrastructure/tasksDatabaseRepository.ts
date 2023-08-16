import { TasksRepository } from '../../../domain/tasks/entities/TasksRepository';
import { Task } from '../../../domain/tasks';
import { RepositoryError } from '../../../domain/errors/RepositoryError';
// @ts-ignore until migrated to TypeScript
import TaskModel from '../models/taskModel';
// @ts-ignore until migrated to TypeScript
import UserFarmModel from '../models/userFarmModel';
import { UserInFarm } from '../../../domain/users';
// @ts-ignore until migrated to TypeScript
import knex from '../util/knex';

export const tasksDatabaseRepository: TasksRepository = {
  pinTask: async (taskId, userId): Promise<Task> => {
    return await handleRepositoryError(
      () => TaskModel.pinTask(taskId, userId),
      'CANNOT_UPDATE_TASK',
    );
  },
  unpinTask: async (taskId, userId): Promise<Task> => {
    return await handleRepositoryError(
      () => TaskModel.unpinTask(taskId, userId),
      'CANNOT_UPDATE_TASK',
    );
  },
  getOwnUserFarmForTask: async (taskId, userId): Promise<UserInFarm> => {
    return await handleRepositoryError(
      async () =>
        (await knex({ uF: 'userFarm' })
          .leftJoin('location', 'userFarm.farm_id', 'location.farm_id')
          .leftJoin('location_tasks', 'location_tasks.location_id', 'location.location_id')
          .where('location_tasks.task_id', taskId)
          .andWhere('uf.user_id', userId)
          .first()) as UserInFarm,
      'CANNOT_FETCH_USER_FARM',
    );
  },
};

const handleRepositoryError = async <T>(
  fn: () => Promise<T>,
  errorMessage: string = 'CANNOT_UPDATE_TASK',
) => {
  try {
    return await fn();
  } catch (e) {
    throw new RepositoryError(errorMessage, e);
  }
};
