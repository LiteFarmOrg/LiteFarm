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

import BaseModel from '../models/baseModel.js';
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
 * Formats and returns an array of management plan data based on the provided management plan group.
 *
 * The function takes a management plan group object (mpg) and processes its management plans
 * to create a formatted array of data. Each item in the array contains information about the
 * management plan, associated management plan group, and tasks related to the management plan.
 *
 * @param {Object} mpg - The management plan group object to extract data from.
 * @returns {Object[]} - An array of formatted management plan data objects with associated tasks.
 */
export const getFormattedManagementPlanData = (mpg) => {
  return mpg.management_plans.map((mp) => {
    // Format tasks first
    const tasks = [];
    mp.crop_management_plan.planting_management_plans.forEach((pmp) => {
      if (pmp.plant_task) {
        const task = _omit(pmp.plant_task.task, [
          ...Object.keys(BaseModel.baseProperties),
          'locationTasks',
        ]);
        const plantTask = _omit(pmp.plant_task, ['task']);
        tasks.push({ ...task, plant_task: plantTask });
        delete pmp.plant_task;
      }
      if (pmp.transplant_task) {
        const task = _omit(pmp.transplant_task.task, [
          ...Object.keys(BaseModel.baseProperties),
          'locationTasks',
        ]);
        const transplantTask = _omit(pmp.transplant_task, ['task']);
        tasks.push({ ...task, transplant_task: transplantTask });
        delete pmp.transplant_task;
      }
      pmp.managementTasks.forEach((mt) => {
        tasks.push(_omit(mt.task, [...Object.keys(BaseModel.baseProperties), 'locationTasks']));
      });
      delete pmp.managementTasks;
    });

    return {
      management_plan: {
        ..._omit(mp, Object.keys(BaseModel.baseProperties)),
        management_plan_group: {
          management_plan_group_id: mpg.management_plan_group_id,
          repetition_count: mpg.repetition_count,
        },
      },
      tasks,
    };
  });
};

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
  return propertyAndRelationKeys.filter((key) =>
    ['omit', 'edit'].includes(Model.templateMappingSchema[key]),
  );
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
    const { plant_task, transplant_task, managementTasks } = plan;
    if (plant_task) {
      plant_task.task.complete_date
        ? dates.push(plant_task.task.complete_date)
        : dates.push(plant_task.task.due_date);
    }
    if (transplant_task) {
      transplant_task.task?.complete_date
        ? dates.push(transplant_task.task.complete_date)
        : dates.push(transplant_task.task.due_date);
    }
    if (managementTasks) {
      managementTasks.forEach((managementTask) => {
        const { task } = managementTask;
        task.complete_date ? dates.push(task.complete_date) : dates.push(task.due_date);
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
  repeat_details,
  createdByUser,
  managementPlanGraph,
  theOnlyActiveUserFarm,
  firstTaskDate,
  newPlantingManagementPlanUUIDs,
) => {
  return {
    ..._omit(managementPlanGraph, getPropertiesToDelete(ManagementPlanModel)),
    name: repeat_details.crop_plan_name,
    crop_management_plan: {
      ..._omit(
        managementPlanGraph.crop_management_plan,
        getPropertiesToDelete(CropManagementPlanModel),
      ),
      // Future looking for implementing LF-3460
      already_in_ground: managementPlanGraph.crop_management_plan.already_in_ground,
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
            //Future looking to allow location changing LF-3367
            location_id: plan.location_id,
            managementTasks: plan.managementTasks
              ? plan.managementTasks.map((managementTask) => {
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
                      //Future looking to allow location changing LF-3367
                      coordinates: managementTask.task.coordinates,
                      owner_user_id: createdByUser,
                      assignee_user_id: theOnlyActiveUserFarm
                        ? theOnlyActiveUserFarm.user_id
                        : null,
                      //Set wage confidently without causing labour expense issues LF-3458
                      wage_at_moment: null,
                      pest_control_task: managementTask.task.pest_control_task
                        ? {
                            ..._omit(
                              managementTask.task.pest_control_task,
                              getPropertiesToDelete(PestControlTaskModel),
                            ),
                          }
                        : null,
                      irrigation_task: managementTask.task.irrigation_task
                        ? {
                            ..._omit(
                              managementTask.task.irrigation_task,
                              getPropertiesToDelete(IrrigationTaskModel),
                            ),
                          }
                        : null,
                      scouting_task: managementTask.task.scouting_task
                        ? {
                            ..._omit(
                              managementTask.task.scouting_task,
                              getPropertiesToDelete(ScoutingTaskModel),
                            ),
                          }
                        : null,
                      soil_task: managementTask.task.soil_task
                        ? {
                            ..._omit(
                              managementTask.task.soil_task,
                              getPropertiesToDelete(SoilTaskModel),
                            ),
                          }
                        : null,
                      soil_amendment_task: managementTask.task.soil_amendment_task
                        ? {
                            ..._omit(
                              managementTask.task.soil_amendment_task,
                              getPropertiesToDelete(SoilAmendmentTaskModel),
                            ),
                          }
                        : null,
                      field_work_task: managementTask.task.field_work_task
                        ? {
                            ..._omit(
                              managementTask.task.field_work_task,
                              getPropertiesToDelete(FieldWorkTaskModel),
                            ),
                          }
                        : null,
                      harvest_task: managementTask.task.harvest_task
                        ? {
                            ..._omit(
                              managementTask.task.harvest_task,
                              getPropertiesToDelete(HarvestTaskModel),
                            ),
                          }
                        : null,
                      cleaning_task: managementTask.task.cleaning_task
                        ? {
                            ..._omit(
                              managementTask.task.cleaning_task,
                              getPropertiesToDelete(CleaningTaskModel),
                            ),
                          }
                        : null,
                      locationTasks: managementTask.task.locationTasks
                        ? managementTask.task.locationTasks.map((locationTask) => {
                            return {
                              //Future looking to allow location changing LF-3367
                              location_id: locationTask.location_id,
                            };
                          })
                        : null,
                    },
                  };
                })
              : null,
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
                    // Set confidently without causing labour expense issues LF-3458
                    wage_at_moment: null,
                    //Future looking to allow location changing LF-3367
                    coordinates: plan.plant_task.task.coordinates,
                    //Future looking to allow location changing LF-3367
                    locationTasks: plan.plant_task.task.locationTasks
                      ? plan.plant_task.task.locationTasks.map((locationTask) => {
                          return {
                            //Future looking to allow location changing LF-3367
                            location_id: locationTask.location_id,
                          };
                        })
                      : null,
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
                    // Set confidently without causing labour expense issues LF-3458,
                    wage_at_moment: null,
                    coordinates: plan.transplant_task.task.coordinates,
                    locationTasks: plan.transplant_task.task.locationTasks
                      ? plan.transplant_task.task.locationTasks.map((locationTask) => {
                          return {
                            //Future looking to allow location changing LF-3367
                            location_id: locationTask.location_id,
                          };
                        })
                      : null,
                  },
                  prev_planting_management_plan_id:
                    newPlantingManagementPlanUUIDs[
                      plan.transplant_task.prev_planting_management_plan_id
                    ],
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
 * @param {Object} repeat_details - The repetition configuration for the management plan group template.
 * @param {Date[]} sortedStartDates - An array of sorted start dates for the management plan templates.
 * @param {Object} managementPlanGraph - The management plan graph used as the template object.
 * @param {Object} theOnlyActiveUserFarm - Null if more than one 'Active' userFarm.
 * @param {Date|string} firstTaskDate - The date of the first task in the management plan templates.
 *                                      It can be a Date object or a date string in "YYYY-MM-DD" format.
 * @returns {Object} - The management plan group graph object to be upserted.
 */
export const getManagementPlanGroupTemplateGraph = (
  createdByUser,
  repeat_details,
  sortedStartDates,
  managementPlanGraph,
  theOnlyActiveUserFarm,
  firstTaskDate,
) => {
  return {
    repetition_count: sortedStartDates.length,
    repetition_config: repeat_details,
    management_plans: sortedStartDates.map((date, index) => {
      const newPlantingManagementPlanUUIDs = getUUIDMap(
        managementPlanGraph.crop_management_plan.planting_management_plans,
        'planting_management_plan_id',
      );
      return getManagementPlanTemplateGraph(
        date,
        index,
        repeat_details,
        createdByUser,
        managementPlanGraph,
        theOnlyActiveUserFarm,
        firstTaskDate,
        newPlantingManagementPlanUUIDs,
      );
    }),
  };
};
