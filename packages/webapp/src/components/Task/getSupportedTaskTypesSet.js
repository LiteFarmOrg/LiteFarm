/**
 *
 * @param isAdmin {boolean}
 * @return {Set<string>}
 */
export const getSupportedTaskTypesSet = (isAdmin) => {
  const supportedTaskTypes = new Set([
    'SOIL_AMENDMENT_TASK',
    'FIELD_WORK_TASK',
    'PEST_CONTROL_TASK',
    'CLEANING_TASK',
    'HARVEST_TASK',
    'IRRIGATION_TASK',
  ]);

  if (isAdmin) {
    supportedTaskTypes.add('PLANT_TASK');
    supportedTaskTypes.add('TRANSPLANT_TASK');
  }
  return supportedTaskTypes;
};
