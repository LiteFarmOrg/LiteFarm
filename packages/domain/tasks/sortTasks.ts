import { AbandonedTask, Task } from "./Task";
import {
  isTaskAbandoned,
  isTaskCompleted,
  isTaskCompletedOrAbandoned,
  isTaskYetToBeDone,
} from "./TaskStatus";
import { isTaskPinned } from "./isTaskPinned";

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
  (sortFn: (taskA: Task, taskB: Task) => number, isAscending: boolean) =>
  (taskA: Task, taskB: Task) =>
    sortFn(taskA, taskB) * (isAscending ? bBeforeA : aBeforeB);
