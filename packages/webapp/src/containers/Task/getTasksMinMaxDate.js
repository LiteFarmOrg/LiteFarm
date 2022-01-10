export const getTasksMinMaxDate = (tasks = []) => {
  let startDate;
  let endDate;
  for (const { due_date } of tasks) {
    const date = new Date(due_date).getTime();
    if (!startDate) {
      startDate = date;
    } else if (date < startDate) {
      !endDate && (endDate = startDate);
      startDate = date;
    } else if (!endDate) {
      endDate = date;
    } else if (date > endDate) {
      endDate = date;
    }
  }
  return { startDate, endDate };
};
