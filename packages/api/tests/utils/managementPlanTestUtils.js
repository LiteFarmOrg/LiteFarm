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
import ManagementPlanModel from '../../src/models/managementPlanModel.js';
import CropManagementPlanModel from '../../src/models/cropManagementPlanModel.js';
import PlantingManagementPlanModel from '../../src/models/plantingManagementPlanModel.js';
import ManagementTasksModel from '../../src/models/managementTasksModel.js';
import TaskModel from '../../src/models/taskModel.js';
import TransplantTaskModel from '../../src/models/transplantTaskModel.js';
import PlantTaskModel from '../../src/models/plantTaskModel.js';
import PestControlTaskModel from '../../src/models/pestControlTask.js';
import ScoutingTaskModel from '../../src/models/scoutingTaskModel.js';
import SoilTaskModel from '../../src/models/soilTaskModel.js';
import SoilAmendmentTaskModel from '../../src/models/soilAmendmentTaskModel.js';
import IrrigationTaskModel from '../../src/models/irrigationTaskModel.js';
import HarvestTaskModel from '../../src/models/harvestTaskModel.js';
import FieldWorkTaskModel from '../../src/models/fieldWorkTaskModel.js';
import CleaningTaskModel from '../../src/models/cleaningTaskModel.js';
import RowMethodModel from '../../src/models/rowMethodModel.js';
import BroadcastMethodModel from '../../src/models/broadcastMethodModel.js';
import BedMethodModel from '../../src/models/bedMethodModel.js';
import ContainerMethodModel from '../../src/models/containerMethodModel.js';
import { getPropertiesToDelete } from '../../src/util/copyCropPlan.js';
import _omit from 'lodash/omit.js';

/**
 * Generates a management plan group graph based on the provided parameters.
 *
 * The function constructs a management plan group graph object for testing equality between copies in jest tests
 *
 * @param {Object} managementPlanGraph - The management plan graph used as the template object.
 *
 * @returns {Object} - Only the 'keep' properties of model template mapping in the form of a management plan group graph object.
 */

export const getBareBonesManagementPlan = (managementPlanGraph) => {
  return {
    ..._omit(managementPlanGraph, getPropertiesToDelete(ManagementPlanModel)),
    crop_management_plan: {
      ..._omit(
        managementPlanGraph.crop_management_plan,
        getPropertiesToDelete(CropManagementPlanModel),
      ),
      planting_management_plans: managementPlanGraph.crop_management_plan.planting_management_plans.map(
        (plan) => {
          return {
            ..._omit(plan, getPropertiesToDelete(PlantingManagementPlanModel)),
            //Future looking to allow location changing LF-3367
            location_id: plan.location_id,
            managementTasks: plan.managementTasks
              ? plan.managementTasks.map((managementTask) => {
                  return {
                    ..._omit(managementTask, getPropertiesToDelete(ManagementTasksModel)),
                    task: {
                      ..._omit(managementTask.task, getPropertiesToDelete(TaskModel)),
                      //Future looking to allow location changing LF-3367
                      coordinates: managementTask.task.coordinates,
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
                  task: {
                    ..._omit(plan.plant_task.task, getPropertiesToDelete(TaskModel)),
                    coordinates: plan.plant_task.task.coordinates,
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
                  task: {
                    ..._omit(plan.transplant_task.task, getPropertiesToDelete(TaskModel)),
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
                }
              : null,
            bed_method: plan.bed_method
              ? {
                  ..._omit(plan.bed_method, getPropertiesToDelete(BedMethodModel)),
                }
              : null,
            container_method: plan.container_method
              ? {
                  ..._omit(plan.container_method, getPropertiesToDelete(ContainerMethodModel)),
                }
              : null,
            broadcast_method: plan.broadcast_method
              ? {
                  ..._omit(plan.broadcast_method, getPropertiesToDelete(BroadcastMethodModel)),
                }
              : null,
            row_method: plan.row_method
              ? {
                  ..._omit(plan.row_method, getPropertiesToDelete(RowMethodModel)),
                }
              : null,
          };
        },
      ),
    },
  };
};
