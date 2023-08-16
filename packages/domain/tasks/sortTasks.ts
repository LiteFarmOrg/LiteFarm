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
import {
  AbandonedTask,
  isTaskAbandoned,
  isTaskCompleted,
  isTaskCompletedOrAbandoned,
  isTaskPinned,
  isTaskYetToBeDone,
  Task,
} from "./entities/Task";

export const sortTasks = (tasks: Task[], isAscending = true) =>
  [...tasks].sort(byDefaultTaskOrder(isAscending));

const aBeforeB = -1;
const bBeforeA = 1;

const byDefaultTaskOrder =
  (isAscending: boolean = true) =>
  (taskA: Task, taskB: Task) => {
    if (isTaskPinned(taskA) && !isTaskPinned(taskB)) return aBeforeB;
    if (!isTaskPinned(taskA) && isTaskPinned(taskB)) return bBeforeA;

    if (isTaskYetToBeDone(taskA) && isTaskCompletedOrAbandoned(taskB)) {
      return aBeforeB;
    }
    if (isTaskCompleted(taskA) && isTaskAbandoned(taskB)) {
      return aBeforeB;
    }
    if (isTaskYetToBeDone(taskA) && isTaskYetToBeDone(taskB)) {
      return withOrder(byCompletedDate, isAscending)(taskA, taskB);
    }
    if (taskA.status === "completed" && taskB.status === "completed") {
      return withOrder(byCompletedDate, isAscending)(taskA, taskB);
    }
    if (taskA.status === "abandoned" && taskB.status === "abandoned") {
      return withOrder(byAbandonDate, isAscending)(taskA, taskB);
    }
    return bBeforeA;
  };

const byCompletedDate = (taskA: Task, taskB: Task): number =>
  new Date(taskA.date).getTime() - new Date(taskB.date).getTime();

const byAbandonDate = (taskA: AbandonedTask, taskB: AbandonedTask): number =>
  new Date(taskA.abandon_date).getTime() -
  new Date(taskB.abandon_date).getTime();

const withOrder =
  <T extends Task>(
    sortFn: (taskA: T, taskB: T) => number,
    isAscending: boolean
  ) =>
  (taskA: T, taskB: T) =>
    sortFn(taskA, taskB) * (isAscending ? bBeforeA : aBeforeB);
