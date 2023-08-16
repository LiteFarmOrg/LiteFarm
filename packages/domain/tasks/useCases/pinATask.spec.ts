import { pinATask } from "./pinATask";
import { TasksRepository } from "../entities/TasksRepository";
import { OWNER_ROLE_ID, WORKER_ROLE_ID } from "../../users/UserInFarm";
import { Task } from "../entities/Task";

describe("pinATask", () => {
  it("saves pinned state for referenced task", async () => {
    const pinTask = jest.fn(
      async (taskId) =>
        ({
          task_id: taskId,
          pinned: true,
        } as Task)
    );

    const inMemoryTaskRepository: TasksRepository = {
      pinTask,
      unpinTask: jest.fn(),
      // @ts-ignore don’t need all properties
      getOwnUserFarmForTask: async () => ({
        farm_id: "farm",
        role_id: OWNER_ROLE_ID,
      }),
    };

    const task = await pinATask({ tasksRepository: inMemoryTaskRepository })(
      "user",
      "farm",
      1
    );

    expect(task).toHaveProperty("task_id", 1);
    expect(task).toHaveProperty("pinned", true);
    expect(pinTask).toHaveBeenCalledWith(1, "user");
  });
  it("throws an AUTHORIZATION ERROR if user is worker in farm", async () => {
    const pinTask = jest.fn(
      async (taskId) =>
        ({
          task_id: taskId,
          pinned: true,
        } as Task)
    );

    const inMemoryTaskRepository: TasksRepository = {
      pinTask,
      unpinTask: jest.fn(),
      // @ts-ignore don’t need all properties
      getOwnUserFarmForTask: async () => ({
        farm_id: "farm",
        role_id: WORKER_ROLE_ID,
      }),
    };

    await expect(() =>
      pinATask({ tasksRepository: inMemoryTaskRepository })("user", "farm", 1)
    ).rejects.toThrow("UNAUTHORIZED_ACTION_ERROR");

    expect(pinTask).not.toHaveBeenCalled();
  });
  it("throws an FARM_MISMATCH error if user is not mentionning the task’s farm", async () => {
    const pinTask = jest.fn(
      async (taskId) =>
        ({
          task_id: taskId,
          pinned: true,
        } as Task)
    );

    const inMemoryTaskRepository: TasksRepository = {
      pinTask,
      unpinTask: jest.fn(),
      // @ts-ignore don’t need all properties
      getOwnUserFarmForTask: async () => ({
        farm_id: "farm",
        role_id: OWNER_ROLE_ID,
      }),
    };

    await expect(() =>
      pinATask({ tasksRepository: inMemoryTaskRepository })(
        "user",
        "otherFarm",
        1
      )
    ).rejects.toThrow("Farm mismatch");

    expect(pinTask).not.toHaveBeenCalled();
  });
});
