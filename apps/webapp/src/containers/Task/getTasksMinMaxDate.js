export const getTasksMinMaxDate = (tasks = []) => {
  let startDate;
  let endDate;
  for (const { due_date } of tasks) {
    if (!startDate) {
      startDate = due_date;
    } else if (due_date < startDate) {
      !endDate && (endDate = startDate);
      startDate = due_date;
    } else if (!endDate) {
      endDate = due_date;
    } else if (due_date > endDate) {
      endDate = due_date;
    }
  }
  return { startDate, endDate };
};
