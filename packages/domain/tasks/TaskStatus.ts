import { Task } from "./Task";

export type TaskYetToBeDoneStatus = "planned" | "late" | "forReview";
export type TaskCompletedStatus = "completed";
export type TaskAbandonedStatus = "abandoned";
export type TaskCompletedOrAbandonedStatus =
  | TaskCompletedStatus
  | TaskAbandonedStatus;
export type TaskStatus = TaskYetToBeDoneStatus | TaskCompletedOrAbandonedStatus;

export const isTaskCompleted = (task: Task): boolean =>
  task.status === "completed";

export const isTaskAbandoned = (task: Task): boolean =>
  task.status === "abandoned";

export const isTaskCompletedOrAbandoned = (task: Task): boolean =>
  isTaskAbandoned(task) || isTaskCompleted(task);

export const isTaskYetToBeDone = (task: Task): boolean =>
  !isTaskCompletedOrAbandoned(task);
