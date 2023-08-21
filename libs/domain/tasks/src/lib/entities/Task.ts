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
