interface TaskBase {
  task_id: number;
  date: string;
  pinned: boolean;
  assignee_user_id?: string;
}

export type TaskYetToBeDoneStatus = "planned" | "late" | "forReview";
export type TaskCompletedStatus = "completed";
export type TaskAbandonedStatus = "abandoned";
export type TaskCompletedOrAbandonedStatus =
  | TaskCompletedStatus
  | TaskAbandonedStatus;
export type TaskStatus = TaskYetToBeDoneStatus | TaskCompletedOrAbandonedStatus;

export interface TaskYetToBeDone extends TaskBase {
  status: TaskYetToBeDoneStatus;
}

export interface AbandonedTask extends TaskBase {
  status: TaskAbandonedStatus;
  abandon_date: string;
}

export interface CompletedTask extends TaskBase {
  status: TaskCompletedStatus;
}

export type TaskType = { farm_id: string; task_translation_key: string };

export type Task = TaskYetToBeDone | AbandonedTask | CompletedTask;

export const getTaskId = (task: Task): Task["task_id"] => task.task_id;

export const hasTaskId =
  (id: Task["task_id"]) =>
  (task: Task): boolean =>
    getTaskId(task) === id;

export const isTaskPinned = (task: Task): boolean => task.pinned;

export const isTaskCompleted = (task: Task): boolean =>
  task.status === "completed";
export const isTaskAbandoned = (task: Task): boolean =>
  task.status === "abandoned";
export const isTaskCompletedOrAbandoned = (task: Task): boolean =>
  isTaskAbandoned(task) || isTaskCompleted(task);
export const isTaskYetToBeDone = (task: Task): boolean =>
  !isTaskCompletedOrAbandoned(task);
