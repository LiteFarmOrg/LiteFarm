export const getTasksMinMaxDate = (tasks = []) => {
  let startDate;
  let endDate;
  for (const { planned_time } of tasks) {
    const date = new Date(planned_time).getTime();
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
