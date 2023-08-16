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
import { TasksRepository } from "../entities/TasksRepository";
import { Task } from "../entities/Task";
import FarmMismatchError from "../../errors/FarmMismatchError";
import {
  userIsExtensionOfficerOfFarm,
  userIsManagerOfFarm,
  userIsOwnerOfFarm,
} from "../../users/UserInFarm";
import UnauthorizedActionError from "../../errors/UnauthorizedActionError";
import { User } from "../../users";

interface Dependencies {
  tasksRepository: TasksRepository;
}

export const pinATask =
  ({ tasksRepository }: Dependencies) =>
  async (
    userId: User["user_id"],
    farmId: string,
    taskId: number,
    unpin: boolean = false
  ): Promise<Task> => {
    const userInFarm = await tasksRepository.getOwnUserFarmForTask(
      taskId,
      userId
    );

    if (farmId !== userInFarm.farm_id)
      throw new FarmMismatchError(userInFarm.farm_id, farmId);

    if (
      !userIsOwnerOfFarm(userInFarm) &&
      !userIsManagerOfFarm(userInFarm) &&
      !userIsExtensionOfficerOfFarm(userInFarm)
    ) {
      throw new UnauthorizedActionError(
        "UNAUTHORIZED_TO_PIN_A_TASK_ON_THIS_FARM"
      );
    }

    return unpin
      ? await tasksRepository.unpinTask(taskId, userId)
      : await tasksRepository.pinTask(taskId, userId);
  };
