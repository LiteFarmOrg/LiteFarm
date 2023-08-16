import {
  TaskAbandonedStatus,
  TaskCompletedStatus,
  TaskYetToBeDoneStatus,
} from "./TaskStatus";

interface TaskBase {
  task_id: number;
  date: string;
  pinned: boolean;
  assignee_user_id?: string;
}

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

export type Task = TaskYetToBeDone | AbandonedTask | CompletedTask;

export const getTaskId = (task: Task): Task["task_id"] => task.task_id;

export const hasTaskId =
  (id: Task["task_id"]) =>
  (task: Task): boolean =>
    getTaskId(task) === id;
