import { Task } from "./Task";
import { User, UserInFarm } from "../../users";

export interface TasksRepository {
  getOwnUserFarmForTask: (
    taskId: Task["task_id"],
    userId: User["user_id"]
  ) => Promise<UserInFarm>;
  pinTask: (taskId: Task["task_id"], userId: User["user_id"]) => Promise<Task>;
  unpinTask: (
    taskId: Task["task_id"],
    userId: User["user_id"]
  ) => Promise<Task>;
}
