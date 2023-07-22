export const getPropertiesToDelete = (Model) => {
  const propertyAndRelationKeys = Model.templateMappingSchema
    ? Object.keys(Model.templateMappingSchema)
    : [];
  return propertyAndRelationKeys.length
    ? propertyAndRelationKeys.filter((key) =>
        ['omit', 'edit'].includes(Model.templateMappingSchema[key]),
      )
    : [];
};

export const getDatesFromManagementPlanGraph = (managementPlanGraph) => {
  const dates = [];
  managementPlanGraph.crop_management_plan.planting_management_plans.forEach((plan) => {
    if (plan.plant_task) {
      plan.plant_task.task.complete_date
        ? dates.push(plan.plant_task.task.complete_date)
        : dates.push(plan.plant_task.task.due_date);
    }
    if (plan.transplant_task) {
      plan.transplant_task.task?.complete_date
        ? dates.push(plan.transplant_task.task.complete_date)
        : dates.push(plan.transplant_task.task.due_date);
    }
    if (plan.managementTasks) {
      plan.managementTasks.forEach((managementTask) => {
        managementTask.task.complete_date
          ? dates.push(managementTask.task.complete_date)
          : dates.push(managementTask.task.due_date);
      });
    }
  });
  return dates;
};

export const getAdjustedDate = (property, obj, firstTaskDate, date) => {
  if (obj[property] === null) {
    return null;
  }
  const templateDate = new Date(obj[property]);
  const adjustment = templateDate - firstTaskDate;
  const newTime = new Date(date).getTime() + adjustment;
  const newDate = new Date(newTime);
  const formattedDate = newDate.toISOString().split('T')[0];
  return formattedDate;
};
