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
