import ManagementPlanModel from '../models/managementPlanModel.js';
import CropManagementPlanModel from '../models/cropManagementPlanModel.js';
import PlantingManagementPlanModel from '../models/plantingManagementPlanModel.js';
import ManagementTasksModel from '../models/managementTasksModel.js';
import TaskModel from '../models/taskModel.js';
import TransplantTaskModel from '../models/transplantTaskModel.js';
import PlantTaskModel from '../models/plantTaskModel.js';
import PestControlTaskModel from '../models/pestControlTask.js';
import ScoutingTaskModel from '../models/scoutingTaskModel.js';
import SoilTaskModel from '../models/soilTaskModel.js';
import SoilAmendmentTaskModel from '../models/soilAmendmentTaskModel.js';
import IrrigationTaskModel from '../models/irrigationTaskModel.js';
import HarvestTaskModel from '../models/harvestTaskModel.js';
import FieldWorkTaskModel from '../models/fieldWorkTaskModel.js';
import CleaningTaskModel from '../models/cleaningTaskModel.js';
import RowMethodModel from '../models/rowMethodModel.js';
import BroadcastMethodModel from '../models/broadcastMethodModel.js';
import BedMethodModel from '../models/bedMethodModel.js';
import ContainerMethodModel from '../models/containerMethodModel.js';
import _omit from 'lodash/omit.js';
import { getUUIDMap } from '../util/util.js';

/**
 * Retrieves the properties to delete from the Model based on its template mapping schema.
 *
 * @param {Object} Model - The model object for which properties to delete will be determined.
 * @returns {string[]} - An array of property names that are marked for deletion in the Model's template mapping schema.
 */
export const getPropertiesToDelete = (Model) => {
  // Check if the Model has a templateMappingSchema property and get the keys.
  const propertyAndRelationKeys = Model.templateMappingSchema
    ? Object.keys(Model.templateMappingSchema)
    : [];

  // If there are properties in the template mapping schema, filter those marked for deletion ('omit' or 'edit').
  return propertyAndRelationKeys.length
    ? propertyAndRelationKeys.filter((key) =>
        ['omit', 'edit'].includes(Model.templateMappingSchema[key]),
      )
    : [];
};

/**
 * Retrieves an array of dates from the provided managementPlanGraph object.
 *
 * The function chooses a dates from each task within the managementPlanGraph
 * and returns them in a single array.
 *
 * @param {Object} managementPlanGraph - The management plan graph object.
 * @returns {string[]} - An array of date strings extracted from various tasks within the management plan graph.
 */
export const getDatesFromManagementPlanGraph = (managementPlanGraph) => {
  const dates = [];
  managementPlanGraph.crop_management_plan.planting_management_plans.forEach((plan) => {
    // Check if there are plant tasks, transplant tasks or management tasks
    // and add their complete_date or due_date to the dates array.
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

  // Return the array containing all the dates from the management plan graph.
  return dates;
};

/**
 * Calculates and returns an adjusted date based on the provided parameters.
 *
 * The function takes a property from the object, calculates the difference
 * between the template date and the first task date, and applies this adjustment
 * to the input date to return the adjusted date in the format "YYYY-MM-DD".
 *
 * @param {string} property - The property in the object to retrieve the template date.
 * @param {Object} obj - The object containing the template date as a property value.
 * @param {Date|string} firstTaskDate - The first task date to calculate the adjustment.
 *                                     It can be a Date object or a date string in "YYYY-MM-DD" format.
 * @param {Date|string} date - The input date to adjust. It can be a Date object or a date string in "YYYY-MM-DD" format.
 * @returns {string|null} - The adjusted date in "YYYY-MM-DD" format, or null if the property in the object is null.
 */
export const getAdjustedDate = (property, obj, firstTaskDate, date) => {
  // Check if the property in the object is null, and return null if it is.
  if (obj[property] === null) {
    return null;
  }
  // Convert the template date to a Date object and calculate the adjustment.
  const templateDate = new Date(obj[property]);
  const adjustment = templateDate - firstTaskDate;

  // Calculate the new time by adding the adjustment to the input date.
  const newTime = new Date(date).getTime() + adjustment;

  // Create a new Date object using the new time and format it to "YYYY-MM-DD".
  const newDate = new Date(newTime);
  const formattedDate = newDate.toISOString().split('T')[0];
  return formattedDate;
};

/**
 * Generates a management plan graph for a specific date and repetition index.
 *
 * The function constructs a management plan template graph object containing information
 * about the management plan, tasks, adjustments, and relevant data for the given date and repetition.
 *
 * @param {Date|string} date - The specific date for which the management plan template graph is generated.
 *                             It can be a Date object or a date string in "YYYY-MM-DD" format.
 * @param {number} index - The index of the repetition for which the management plan template graph is generated.
 *                         It should be null if not created by a management plan group.
 * @param {string} createdByUser - The username of the user who is repeating the management plan.
 * @param {Object} managementPlanGraph - The management plan graph template object.
 * @param {Object} theOnlyActiveUserFarm - Null if more than one 'Active' userFarm.
 * @param {Date|string} firstTaskDate - The date of the first task in the management plan templates.
 *                                      It can be a Date object or a date string in "YYYY-MM-DD" format.
 * @param {Object} newPlantingManagementPlanUUIDs - An object containing new UUIDs for planting management plans.
 * @returns {Object} - The management plan template graph object for the given date and repetition index.
 */
export const getManagementPlanTemplateGraph = (
  date,
  index,
  createdByUser,
  managementPlanGraph,
  theOnlyActiveUserFarm,
  firstTaskDate,
  newPlantingManagementPlanUUIDs,
) => {
  return {
    ..._omit(managementPlanGraph, getPropertiesToDelete(ManagementPlanModel)),
    //TODO: handle name
    name: `${managementPlanGraph.name} ${date}`,
    crop_management_plan: {
      ..._omit(
        managementPlanGraph.crop_management_plan,
        getPropertiesToDelete(CropManagementPlanModel),
      ),
      seed_date: getAdjustedDate(
        'seed_date',
        managementPlanGraph.crop_management_plan,
        firstTaskDate,
        date,
      ),
      plant_date: getAdjustedDate(
        'plant_date',
        managementPlanGraph.crop_management_plan,
        firstTaskDate,
        date,
      ),
      germination_date: getAdjustedDate(
        'germination_date',
        managementPlanGraph.crop_management_plan,
        firstTaskDate,
        date,
      ),
      transplant_date: getAdjustedDate(
        'transplant_date',
        managementPlanGraph.crop_management_plan,
        firstTaskDate,
        date,
      ),
      harvest_date: getAdjustedDate(
        'harvest_date',
        managementPlanGraph.crop_management_plan,
        firstTaskDate,
        date,
      ),
      termination_date: getAdjustedDate(
        'termination_date',
        managementPlanGraph.crop_management_plan,
        firstTaskDate,
        date,
      ),
      planting_management_plans: managementPlanGraph.crop_management_plan.planting_management_plans.map(
        (plan) => {
          return {
            ..._omit(plan, getPropertiesToDelete(PlantingManagementPlanModel)),
            planting_management_plan_id:
              newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
            location_id: plan.location_id, // TODO: Allow location changing
            managementTasks: plan.managementTasks.map((managementTask) => {
              return {
                ..._omit(managementTask, getPropertiesToDelete(ManagementTasksModel)),
                planting_management_plan_id:
                  newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                task: {
                  ..._omit(managementTask.task, getPropertiesToDelete(TaskModel)),
                  due_date: getAdjustedDate(
                    managementTask.task.complete_date ? 'complete_date' : 'due_date',
                    managementTask.task,
                    firstTaskDate,
                    date,
                  ),
                  coordinates: managementTask.task.coordinates,
                  owner_user_id: createdByUser, // TODO: Allow location changing
                  assignee_user_id: theOnlyActiveUserFarm ? theOnlyActiveUserFarm.user_id : null,
                  wage_at_moment: theOnlyActiveUserFarm?.wage
                    ? theOnlyActiveUserFarm.wage.amount
                    : null,
                  pest_control_task: plan.pest_control_task
                    ? {
                        ..._omit(
                          plan.pest_control_task,
                          getPropertiesToDelete(PestControlTaskModel),
                        ),
                      }
                    : null,
                  irrigation_task: plan.irrigation_task
                    ? {
                        ..._omit(plan.irrigation_task, getPropertiesToDelete(IrrigationTaskModel)),
                      }
                    : null,
                  scouting_task: plan.scouting_task
                    ? {
                        ..._omit(plan.scouting_task, getPropertiesToDelete(ScoutingTaskModel)),
                      }
                    : null,
                  soil_task: plan.soil_task
                    ? {
                        ..._omit(plan.soil_task, getPropertiesToDelete(SoilTaskModel)),
                      }
                    : null,
                  soil_amendment_task: plan.soil_amendment_task
                    ? {
                        ..._omit(
                          plan.soil_amendment_task,
                          getPropertiesToDelete(SoilAmendmentTaskModel),
                        ),
                      }
                    : null,
                  field_work_task: plan.field_work_task
                    ? {
                        ..._omit(plan.field_work_task, getPropertiesToDelete(FieldWorkTaskModel)),
                      }
                    : null,
                  harvest_task: plan.harvest_task
                    ? {
                        ..._omit(plan.harvest_task, getPropertiesToDelete(HarvestTaskModel)),
                      }
                    : null,
                  cleaning_task: plan.cleaning_task
                    ? {
                        ..._omit(plan.cleaning_task, getPropertiesToDelete(CleaningTaskModel)),
                      }
                    : null,
                  locationTasks: managementTask.task.locationTasks.map((locationTask) => {
                    return {
                      location_id: locationTask.location_id,
                    };
                  }),
                },
              };
            }),
            plant_task: plan.plant_task
              ? {
                  ..._omit(plan.plant_task, getPropertiesToDelete(PlantTaskModel)),
                  planting_management_plan_id:
                    newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                  task: {
                    ..._omit(plan.plant_task.task, getPropertiesToDelete(TaskModel)),
                    due_date: getAdjustedDate(
                      plan.plant_task.task.complete_date ? 'complete_date' : 'due_date',
                      plan.plant_task.task,
                      firstTaskDate,
                      date,
                    ),
                    owner_user_id: createdByUser,
                    assignee_user_id: theOnlyActiveUserFarm ? theOnlyActiveUserFarm.user_id : null,
                    wage_at_moment: theOnlyActiveUserFarm?.wage
                      ? theOnlyActiveUserFarm.wage.amount
                      : null,
                    coordinates: plan.plant_task.task.coordinates,
                    // TODO: Allow location changing
                    // locations: location_tasks
                  },
                }
              : null,
            transplant_task: plan.transplant_task
              ? {
                  ..._omit(plan.transplant_task, getPropertiesToDelete(TransplantTaskModel)),
                  planting_management_plan_id:
                    newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                  task: {
                    ..._omit(plan.transplant_task.task, getPropertiesToDelete(TaskModel)),
                    due_date: getAdjustedDate(
                      plan.transplant_task.task.complete_date ? 'complete_date' : 'due_date',
                      plan.transplant_task.task,
                      firstTaskDate,
                      date,
                    ),
                    owner_user_id: createdByUser,
                    assignee_user_id: theOnlyActiveUserFarm ? theOnlyActiveUserFarm.user_id : null,
                    wage_at_moment: theOnlyActiveUserFarm?.wage
                      ? theOnlyActiveUserFarm.wage.amount
                      : null,
                    coordinates: plan.transplant_task.task.coordinates,
                    // TODO: Allow location changing
                    // locations: location_tasks
                  },
                  prev_planting_management_plan_id:
                    newPlantingManagementPlanUUIDs[
                      plan.transplant_task.prev_planting_management_plan_id
                    ], // can this be done here ?
                }
              : null,
            bed_method: plan.bed_method
              ? {
                  ..._omit(plan.bed_method, getPropertiesToDelete(BedMethodModel)),
                  planting_management_plan_id:
                    newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                }
              : null,
            container_method: plan.container_method
              ? {
                  ..._omit(plan.container_method, getPropertiesToDelete(ContainerMethodModel)),
                  planting_management_plan_id:
                    newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                }
              : null,
            broadcast_method: plan.broadcast_method
              ? {
                  ..._omit(plan.broadcast_method, getPropertiesToDelete(BroadcastMethodModel)),
                  planting_management_plan_id:
                    newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                }
              : null,
            row_method: plan.row_method
              ? {
                  ..._omit(plan.row_method, getPropertiesToDelete(RowMethodModel)),
                  planting_management_plan_id:
                    newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                }
              : null,
          };
        },
      ),
    },
    repetition_number: index + 1,
  };
};

/**
 * Generates a management plan group graph based on the provided parameters.
 *
 * The function constructs a management plan group graph object which can be upserted
 * on the management plan group model.
 *
 * @param {string} createdByUser - The username of the user who initiated the management plan group repetition.
 * @param {Object} repetitionConfig - The repetition configuration for the management plan group template.
 * @param {Date[]} sortedStartDates - An array of sorted start dates for the management plan templates.
 * @param {Object} managementPlanGraph - The management plan graph used as the template object.
 * @param {Object} theOnlyActiveUserFarm - Null if more than one 'Active' userFarm.
 * @param {Date|string} firstTaskDate - The date of the first task in the management plan templates.
 *                                      It can be a Date object or a date string in "YYYY-MM-DD" format.
 * @returns {Object} - The management plan group graph object to be upserted.
 */
export const getManagementPlanGroupTemplateGraph = (
  createdByUser,
  repetitionConfig,
  sortedStartDates,
  managementPlanGraph,
  theOnlyActiveUserFarm,
  firstTaskDate,
) => {
  return {
    repetition_count: repetitionConfig.repetitions, // change to startDates.length
    repetition_config: repetitionConfig,
    management_plans: sortedStartDates.map((date, index) => {
      const newPlantingManagementPlanUUIDs = getUUIDMap(
        managementPlanGraph.crop_management_plan.planting_management_plans,
        'planting_management_plan_id',
      );
      return getManagementPlanTemplateGraph(
        date,
        index,
        createdByUser,
        managementPlanGraph,
        theOnlyActiveUserFarm,
        firstTaskDate,
        newPlantingManagementPlanUUIDs,
      );
    }),
  };
};
