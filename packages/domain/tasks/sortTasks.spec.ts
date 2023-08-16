import { hasTaskId, Task } from "./entities/Task";
import { sortTasks } from "./sortTasks";

describe("sortTasks", () => {
  const unsortedTasks: Task[] = [
    { task_id: 1, status: "planned", date: "2023-08-05", pinned: false },
    { task_id: 2, status: "forReview", date: "2023-08-02", pinned: false },
    { task_id: 3, status: "late", date: "2023-08-03", pinned: false },
    { task_id: 4, status: "completed", date: "2023-08-04", pinned: false },
    {
      task_id: 5,
      status: "abandoned",
      date: "2023-08-05",
      abandon_date: "2023-09-25",
      pinned: false,
    },
    { task_id: 6, status: "planned", date: "2023-09-01", pinned: false },
    { task_id: 7, status: "forReview", date: "2023-09-02", pinned: false },
    { task_id: 8, status: "late", date: "2023-09-03", pinned: false },
    { task_id: 9, status: "completed", date: "2023-09-04", pinned: false },
    {
      task_id: 10,
      status: "abandoned",
      date: "2023-09-05",
      abandon_date: "2023-07-15",
      pinned: false,
    },
    { task_id: 11, status: "planned", date: "2023-08-05", pinned: true },
    { task_id: 12, status: "forReview", date: "2023-08-02", pinned: true },
    { task_id: 13, status: "late", date: "2023-08-03", pinned: true },
    { task_id: 14, status: "completed", date: "2023-08-04", pinned: true },
    {
      task_id: 15,
      status: "abandoned",
      date: "2023-08-05",
      abandon_date: "2023-08-24",
      pinned: true,
    },
    { task_id: 16, status: "planned", date: "2023-09-01", pinned: true },
    { task_id: 17, status: "forReview", date: "2023-09-02", pinned: true },
    { task_id: 18, status: "late", date: "2023-09-03", pinned: true },
    { task_id: 19, status: "completed", date: "2023-09-04", pinned: true },
    {
      task_id: 20,
      status: "abandoned",
      date: "2023-09-05",
      abandon_date: "2023-08-01",
      pinned: true,
    },
    { task_id: 21, status: "completed", date: "2023-08-01", pinned: false },
    { task_id: 22, status: "completed", date: "2023-08-10", pinned: false },
    {
      task_id: 23,
      status: "abandoned",
      date: "2023-08-01",
      abandon_date: "2023-08-25",
      pinned: false,
    },
    {
      task_id: 24,
      status: "abandoned",
      date: "2023-08-10",
      abandon_date: "2023-08-21",
      pinned: false,
    },
  ];

  describe("when sorted ascending", () => {
    const sortedTasks: Task[] = sortTasks(unsortedTasks, true);

    it("puts pinned tasks first", () => {
      expect(sortedTasks.slice(0, 10).every((task) => task.pinned)).toEqual(
        true
      );
    });
    it("then puts completed or abandoned tasks after", () => {
      expect(tasks(sortedTasks).hasTaskId(6).beforeTaskId(4)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(7).beforeTaskId(4)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(8).beforeTaskId(4)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(6).beforeTaskId(5)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(7).beforeTaskId(5)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(8).beforeTaskId(5)).toEqual(true);
    });
    it("puts completed tasks before abandoned tasks", () => {
      expect(tasks(sortedTasks).hasTaskId(9).beforeTaskId(5)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(19).beforeTaskId(15)).toEqual(true);
    });
    it("orders yet to done tasks by ascending due date", () => {
      expect(tasks(sortedTasks).hasTaskId(2).beforeTaskId(3)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(3).beforeTaskId(1)).toEqual(true);
    });
    it("puts earliest completed tasks first", () => {
      expect(tasks(sortedTasks).hasTaskId(21).beforeTaskId(4)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(4).beforeTaskId(22)).toEqual(true);
    });
    it("puts earliest abanboned tasks first", () => {
      expect(tasks(sortedTasks).hasTaskId(10).beforeTaskId(5)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(20).beforeTaskId(15)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(23).beforeTaskId(5)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(24).beforeTaskId(23)).toEqual(true);
    });
  });

  describe("when sorted descending", () => {
    const sortedTasks: Task[] = sortTasks(unsortedTasks, false);

    it("puts pinned tasks first", () => {
      expect(sortedTasks.slice(0, 10).every((task) => task.pinned)).toEqual(
        true
      );
    });
    it("then puts completed or abandoned tasks after", () => {
      expect(tasks(sortedTasks).hasTaskId(6).beforeTaskId(4)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(7).beforeTaskId(4)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(8).beforeTaskId(4)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(6).beforeTaskId(5)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(7).beforeTaskId(5)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(8).beforeTaskId(5)).toEqual(true);
    });
    it("puts completed tasks before abandoned tasks", () => {
      expect(tasks(sortedTasks).hasTaskId(9).beforeTaskId(5)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(19).beforeTaskId(15)).toEqual(true);
    });
    it("orders yet to done tasks by descending due date", () => {
      expect(tasks(sortedTasks).hasTaskId(1).beforeTaskId(3)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(3).beforeTaskId(2)).toEqual(true);
    });
    it("puts latest completed tasks first", () => {
      expect(tasks(sortedTasks).hasTaskId(22).beforeTaskId(4)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(4).beforeTaskId(21)).toEqual(true);
    });
    it("puts latest abanboned tasks first", () => {
      expect(tasks(sortedTasks).hasTaskId(5).beforeTaskId(10)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(15).beforeTaskId(20)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(5).beforeTaskId(23)).toEqual(true);
      expect(tasks(sortedTasks).hasTaskId(23).beforeTaskId(24)).toEqual(true);
    });
  });
});

const tasks = (array: Task[]) => ({
  hasTaskId: (idA: number) => ({
    beforeTaskId: (idB: number) =>
      array.findIndex(hasTaskId(idA)) < array.findIndex(hasTaskId(idB)),
  }),
});
