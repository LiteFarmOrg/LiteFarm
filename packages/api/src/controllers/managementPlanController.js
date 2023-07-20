/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (ManagementPlanController.js) is part of LiteFarm.
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

import ManagementPlanModel from '../models/managementPlanModel.js';
import ManagementPlanGroup from '../models/managementPlanGroupModel.js';
import CropManagementPlanModel from '../models/cropManagementPlanModel.js';
import ManagementTasksModel from '../models/managementTasksModel.js';
import TaskModel from '../models/taskModel.js';
import TaskTypeModel from '../models/taskTypeModel.js';
import FieldWorkTypeModel from '../models/fieldWorkTypeModel.js';
import TransplantTaskModel from '../models/transplantTaskModel.js';
import PlantTaskModel from '../models/plantTaskModel.js';
import objection, { raw } from 'objection';
import lodash from 'lodash';
import { sendTaskNotification, TaskNotificationTypes } from './taskController.js';
import {
  omitKeysFromManagementPlan,
  editKeysFromManagementPlan,
  omitKeysFromCropManagementPlan,
  editKeysFromCropManagementPlan,
  omitKeysFromPlantingManagementPlan,
  editKeysFromPlantingManagementPlan,
  omitKeysFromManagementTask,
  editKeysFromManagementTask,
  omitKeysFromTasks,
  editKeysFromTasks,
  omitKeysFromPlantTask,
  editKeysFromPlantTask,
  omitKeysFromTransplantTask,
  editKeysFromTransplantTask,
  editKeysFromPlantingMethods,
} from '../util/copyCropPlanTemplate.js';
const { transaction, Model } = objection;
import { v4 as uuidv4 } from 'uuid';

const getManagementPlanGraph = async (planId, trx) => {
  return await ManagementPlanModel.query(trx)
    .where('management_plan_id', planId)
    .withGraphFetched(
      'crop_management_plan.[planting_management_plans.[managementTasks.[task.[pest_control_task, irrigation_task, scouting_task, soil_task, field_work_task, harvest_task, cleaning_task, taskType]], plant_task.[task], transplant_task.[task], bed_method, container_method, broadcast_method, row_method]]',
    )
    // TODO: replace when groups added
    //.withGraphFetched('crop_management_plan.[planting_management_plans.[managementTasks.[task.[pest_control_task, irrigation_task, scouting_task, soil_task, field_work_task, harvest_task, cleaning_task, taskType]], plant_task.[task], transplant_task.[task], bed_method, container_method, broadcast_method, row_method]], management_plan_group')
    .first();
};

// For testing returns unique taskIds
// const getTasksFromManagementPlanGraph = (managementPlanGraph) => {
//   let tasks = [];
//   managementPlanGraph.crop_management_plan.planting_management_plans.forEach((plan) => {
//     plan.plant_task?.task_id ? tasks.push(plan.plant_task.task_id) : null;
//     plan.transplant_task?.task_id ? tasks.push(plan.transplant_task.task_id) : null;
//     plan.managementTasks?.length ? plan.managementTasks.forEach(task => tasks.push(task.task_id)) : null;
//   });
//   return [...new Set(tasks)];
// }

const getDatesFromManagementPlanGraph = (managementPlanGraph) => {
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

const getSortedDates = (dates) => {
  const jsDates = dates.map((date) => new Date(date));
  return jsDates.sort((date1, date2) => date1 - date2);
};

const getAdjustedDate = (property, obj, firstTaskDate, date) => {
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

// TODO: Uncomment - Update management plan group
// const makeGroupAndPatchTemplatePlan = async (repetitions, templateIsPartOfGroup, userId, managementPlanId, repetitionNumber) => {
//   let managementPlanGroup;
//   //No group id needed if copying once
//   if(repetitions > 1 || (repetitions === 1 && templateIsPartOfGroup)) {
//     managementPlanGroup = await ManagementPlanGroupModel.query(trx).insert({
//       user_id: userId,
//       repetition_count: repetitions
//     });
//   }
//   if(templateIsPartOfGroup){
//     await ManagementPlanModel.query(trx).findById(managementPlanId).patch({
//       group_id: managementPlanGroup.groupId,
//       repetition_number: repetitionNumber
//     })
//   }
// }

const getUUIDMap = (arr, property) => {
  // assign uuids to template uuids property
  const uuidMap = {};
  arr.forEach((item) => {
    uuidMap[item[property]] = uuidv4();
  });
  return uuidMap;
};

const managementPlanController = {
  repeatManagementPlan() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const {
        startDates, // or calculate if necessary
        managementPlanId,
        templateIsPartOfGroup,
        repetitionConfig, //what in here?
      } = req.body;
      try {
        // Get template management plan
        const managementPlanGraph = await getManagementPlanGraph(managementPlanId, trx);

        // Find the reference date
        const taskDates = getDatesFromManagementPlanGraph(managementPlanGraph);
        const sortedTaskDates = getSortedDates(startDates);
        const firstTaskDate = getSortedDates(taskDates)[0];

        let newManagementPlanGroup = {};
        if (templateIsPartOfGroup && sortedTaskDates.length > 0) {
          //if(group_id && repetition_number === 1){
          newManagementPlanGroup = {
            repetition_count: repetitionConfig.repetitions, // change to startDates.length
            repetition_config: repetitionConfig,
            management_plans: sortedTaskDates.map((date, index) => {
              const newPlantingManagementPlanUUIDs = getUUIDMap(
                managementPlanGraph.crop_management_plan.planting_management_plans,
                'planting_management_plan_id',
              );
              return {
                ...lodash.omit(managementPlanGraph, [
                  ...omitKeysFromManagementPlan,
                  ...editKeysFromManagementPlan,
                ]),
                name: `${managementPlanGraph.name} ${date}`,
                notes: managementPlanGraph.notes,
                crop_management_plan: {
                  ...lodash.omit(managementPlanGraph.crop_management_plan, [
                    ...omitKeysFromCropManagementPlan,
                    ...editKeysFromCropManagementPlan,
                  ]),
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
                        ...lodash.omit(plan, [
                          ...omitKeysFromPlantingManagementPlan,
                          ...editKeysFromPlantingManagementPlan,
                        ]),
                        planting_management_plan_id:
                          newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                        location_id: plan.location_id, // TODO: Allow location changing
                        managementTasks: plan.managementTasks.map((managementTask) => {
                          return {
                            ...lodash.omit(managementTask, [
                              ...omitKeysFromManagementTask,
                              ...editKeysFromManagementTask,
                            ]),
                            task: {
                              ...lodash.omit(managementTask.task, [
                                ...omitKeysFromTasks,
                                ...editKeysFromTasks,
                              ]),
                              due_date: getAdjustedDate(
                                managementTask.task.complete_date ? 'complete_date' : 'due_date',
                                managementTask.task,
                                firstTaskDate,
                                date,
                              ),
                              coordinates: managementTask.task.coordinates, // TODO: Allow location changing
                              pest_control_task: null, //TODO cover case
                              irrigation_task: null, //TODO cover case,
                              scouting_task: null, //TODO cover case,
                              soil_task: null, //TODO cover case,
                              field_work_task: null, //TODO cover case,
                              harvest_task: null, //TODO cover case,
                              cleaning_task: null, //TODO cover case
                            },
                          };
                        }),
                        plant_task: plan.plant_task
                          ? {
                              ...lodash.omit(plan.plant_task, [
                                ...omitKeysFromPlantTask,
                                ...editKeysFromPlantTask,
                              ]),
                              planting_management_plan_id:
                                newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                              task: {
                                ...lodash.omit(plan.plant_task.task, [
                                  ...omitKeysFromTasks,
                                  ...editKeysFromTasks,
                                ]),
                                due_date: getAdjustedDate(
                                  plan.plant_task.task.complete_date ? 'complete_date' : 'due_date',
                                  plan.plant_task.task,
                                  firstTaskDate,
                                  date,
                                ),
                                coordinates: plan.plant_task.task.coordinates, // TODO: Allow location changing
                              },
                            }
                          : null,
                        transplant_task: plan.transplant_task
                          ? {
                              ...lodash.omit(plan.transplant_task, [
                                ...omitKeysFromTransplantTask,
                                ...editKeysFromTransplantTask,
                              ]),
                              planting_management_plan_id:
                                newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                              task: {
                                ...lodash.omit(plan.transplant_task.task, [
                                  ...omitKeysFromTasks,
                                  ...editKeysFromTasks,
                                ]),
                                due_date: getAdjustedDate(
                                  plan.transplant_task.task.complete_date
                                    ? 'complete_date'
                                    : 'due_date',
                                  plan.transplant_task.task,
                                  firstTaskDate,
                                  date,
                                ),
                                coordinates: plan.transplant_task.task.coordinates, // TODO: Allow location changing
                              },
                              prev_planting_management_plan_id:
                                newPlantingManagementPlanUUIDs[
                                  plan.transplant_task.prev_planting_management_plan_id
                                ], // can this be done here ?
                            }
                          : null,
                        bed_method: plan.bed_method
                          ? {
                              ...lodash.omit(plan.bed_method, editKeysFromPlantingMethods),
                              planting_management_plan_id:
                                newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                            }
                          : null,
                        container_method: plan.container_method
                          ? {
                              ...lodash.omit(plan.container_method, editKeysFromPlantingMethods),
                              planting_management_plan_id:
                                newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                            }
                          : null,
                        broadcast_method: plan.broadcast_method
                          ? {
                              ...lodash.omit(plan.broadcast_method, editKeysFromPlantingMethods),
                              planting_management_plan_id:
                                newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                            }
                          : null,
                        row_method: plan.row_method
                          ? {
                              ...lodash.omit(plan.row_method, editKeysFromPlantingMethods),
                              planting_management_plan_id:
                                newPlantingManagementPlanUUIDs[plan.planting_management_plan_id],
                            }
                          : null,
                      };
                    },
                  ),
                },
                repetition_number: index,
              };
            }),
          };
          //} else {
          // TODO translation
          //  throw "Can not add on to existing group"
          //}
        } else {
          // TODO configure not part of group
          throw 'Currently template plan must be part of group';
        }

        //Upsert management group
        const newIds = [];
        const management_plan = await ManagementPlanGroup.query(trx)
          .context({ user_id: req.auth.user_id })
          .upsertGraph(newManagementPlanGroup, {
            noUpdate: true,
            noDelete: true,
            noInsert: ['location', 'crop_variety'],
            insertMissing: true,
          });
        newIds.push(management_plan);

        await trx.commit();
        // return res.status(201).send(managementPlanGraph);
        // return res.status(201).send(newManagementPlans);
        return res.status(201).send(newIds);
      } catch (error) {
        await trx.rollback();
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  addManagementPlan() {
    return async (req, res) => {
      try {
        //TODO: add none getNonModifiable
        const result = await ManagementPlanModel.transaction(async (trx) => {
          // Upsert manament plan
          const management_plan = await ManagementPlanModel.query(trx)
            .context({ user_id: req.auth.user_id })
            .upsertGraph(
              {
                crop_management_plan: req.body.crop_management_plan,
                crop_variety_id: req.body.crop_variety_id,
                name: req.body.name,
                notes: req.body.notes,
              },
              {
                noUpdate: true,
                noDelete: true,
                noInsert: ['location', 'crop_variety'],
              },
            );

          const tasks = [];
          const getTask = (due_date, task_type_id, task = {}) => {
            return {
              due_date,
              task_type_id,
              owner_user_id: req.auth.user_id,
              assignee_user_id: req.body.assignee_user_id,
              ...task,
            };
          };

          // Make plant task
          if (!req.body.crop_management_plan.already_in_ground) {
            const due_date =
              req.body.crop_management_plan.plant_date || req.body.crop_management_plan.seed_date;
            const {
              planting_management_plan_id,
            } = management_plan.crop_management_plan.planting_management_plans.find(
              (planting_management_plan) =>
                planting_management_plan.planting_task_type === 'PLANT_TASK',
            );

            const plantTaskType = await TaskTypeModel.query(trx)
              .where({
                farm_id: null,
                task_translation_key: 'PLANT_TASK',
              })
              .first();
            const plantTask = await TaskModel.query(trx)
              .context(req.auth)
              .upsertGraph(
                getTask(due_date, plantTaskType.task_type_id, {
                  plant_task: { planting_management_plan_id },
                }),
              );
            tasks.push(plantTask);
          }

          //Make transplant task
          if (req.body.crop_management_plan.needs_transplant) {
            const due_date = req.body.crop_management_plan.transplant_date;
            const {
              planting_management_plan_id,
            } = management_plan.crop_management_plan.planting_management_plans.find(
              (planting_management_plan) =>
                planting_management_plan.planting_task_type === 'TRANSPLANT_TASK',
            );
            const {
              planting_management_plan_id: prev_planting_management_plan_id,
            } = management_plan.crop_management_plan.planting_management_plans.find(
              (planting_management_plan) =>
                planting_management_plan.is_final_planting_management_plan === false,
            );
            //TODO: move get task_type_id to frontend LF-1965
            const transplantTaskType = await TaskTypeModel.query(trx)
              .where({
                farm_id: null,
                task_translation_key: 'TRANSPLANT_TASK',
              })
              .first();
            const transplantTask = await TaskModel.query(trx)
              .context(req.auth)
              .upsertGraph(
                getTask(due_date, transplantTaskType.task_type_id, {
                  transplant_task: {
                    planting_management_plan_id,
                    prev_planting_management_plan_id,
                  },
                }),
              );
            tasks.push(transplantTask);
          }
          const { location_id, planting_management_plan_id } =
            management_plan.crop_management_plan.planting_management_plans.find(
              (planting_management_plan) =>
                management_plan.crop_management_plan.needs_transplant
                  ? planting_management_plan.planting_task_type === 'TRANSPLANT_TASK'
                  : planting_management_plan.planting_task_type !== 'TRANSPLANT_TASK',
            ) || {};
          const taskManagementPlansAndLocations = {
            //TODO: already_in_ground && is_wild && !needs_transplant test (pin location)
            locations: location_id ? [{ location_id }] : undefined,
            managementPlans: [{ planting_management_plan_id }],
          };

          // Make Harvest or Termination task
          if (!req.body.crop_management_plan.for_cover) {
            const due_date = req.body.crop_management_plan.harvest_date;
            const harvestTaskType = await TaskTypeModel.query(trx)
              .where({
                farm_id: null,
                task_translation_key: 'HARVEST_TASK',
              })
              .first();
            const harvestTask = await TaskModel.query(trx)
              .context(req.auth)
              .upsertGraph(
                getTask(due_date, harvestTaskType.task_type_id, {
                  harvest_task: { harvest_everything: true },
                  ...taskManagementPlansAndLocations,
                }),
                {
                  relate: ['locations', 'managementPlans'],
                },
              );
            tasks.push(harvestTask);
          } else {
            const due_date = req.body.crop_management_plan.termination_date;
            const fieldWorkTaskType = await TaskTypeModel.query(trx)
              .where({
                farm_id: null,
                task_translation_key: 'FIELD_WORK_TASK',
              })
              .first();
            const fieldWorkType = await FieldWorkTypeModel.query(trx)
              .select('field_work_type_id')
              .where({ field_work_type_translation_key: 'TERMINATION' })
              .first();
            const fieldWorkTask = await TaskModel.query(trx)
              .context(req.auth)
              .upsertGraph(
                getTask(due_date, fieldWorkTaskType.task_type_id, {
                  field_work_task: fieldWorkType,
                  ...taskManagementPlansAndLocations,
                }),
                {
                  relate: ['locations', 'managementPlans'],
                },
              );
            tasks.push(fieldWorkTask);
          }

          if (req.body.assignee_user_id) {
            tasks.forEach(async (task) => {
              const { assignee_user_id, task_type_id } = task;
              const taskTypeTranslation = await TaskTypeModel.getTaskTranslationKeyById(
                task_type_id,
              );
              await sendTaskNotification(
                [assignee_user_id],
                req.auth.user_id,
                task.task_id,
                TaskNotificationTypes.TASK_ASSIGNED,
                taskTypeTranslation.task_translation_key,
                req.headers.farm_id,
              );
            });
          }

          return { management_plan, tasks };
        });
        return res.status(201).send(result);
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  delManagementPlan() {
    return async (req, res) => {
      try {
        const isDeleted = await ManagementPlanModel.query()
          .context(req.auth)
          .where({ management_plan_id: req.params.management_plan_id })
          .delete();
        if (isDeleted) {
          return res.sendStatus(200);
        } else {
          return res.sendStatus(404);
        }
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  completeManagementPlan() {
    return async (req, res) => {
      try {
        const result = await ManagementPlanModel.query()
          .context(req.auth)
          .where({ management_plan_id: req.params.management_plan_id })
          .patch(lodash.pick(req.body, ['complete_date', 'complete_notes', 'rating']));
        if (result) {
          return res.sendStatus(200);
        } else {
          return res.sendStatus(404);
        }
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  abandonManagementPlan() {
    return async (req, res) => {
      try {
        const { management_plan_id } = req.params;
        const result = await ManagementPlanModel.transaction(async (trx) => {
          /**
           * Get all related task_ids and number of related management plans of each task_id
           * @type {{task_id: string, count: string}[]}
           */
          const tasksWithManagementPlanCount = await ManagementTasksModel.query()
            .select('*')
            .join(
              'planting_management_plan',
              'planting_management_plan.planting_management_plan_id',
              'management_tasks.planting_management_plan_id',
            )
            .where('planting_management_plan.management_plan_id', management_plan_id)
            .distinct('task_id')
            .then((tasks) =>
              ManagementTasksModel.query()
                .join(
                  'planting_management_plan',
                  'planting_management_plan.planting_management_plan_id',
                  'management_tasks.planting_management_plan_id',
                )
                .join('task', 'task.task_id', 'management_tasks.task_id')
                .whereNull('task.complete_date')
                .whereIn(
                  'management_tasks.task_id',
                  tasks.map(({ task_id }) => task_id),
                )
                .groupBy('management_tasks.task_id')
                .count('planting_management_plan.management_plan_id')
                .select('management_tasks.task_id'),
            );

          const transplantTasks = await TransplantTaskModel.query()
            .select('*')
            .join(
              'planting_management_plan',
              'planting_management_plan.planting_management_plan_id',
              'transplant_task.planting_management_plan_id',
            )
            .join('task', 'task.task_id', 'transplant_task.task_id')
            .whereNull('task.complete_date')
            .where('planting_management_plan.management_plan_id', management_plan_id);

          const plantTasks = await PlantTaskModel.query()
            .select('*')
            .join(
              'planting_management_plan',
              'planting_management_plan.planting_management_plan_id',
              'plant_task.planting_management_plan_id',
            )
            .join('task', 'task.task_id', 'plant_task.task_id')
            .whereNull('task.complete_date')
            .where('planting_management_plan.management_plan_id', management_plan_id);

          const taskIdsRelatedToOneManagementPlan = [
            ...tasksWithManagementPlanCount.filter(({ count }) => count === '1'),
            ...transplantTasks,
            ...plantTasks,
          ].map(({ task_id }) => task_id);
          await TaskModel.query(trx)
            .context(req.auth)
            .whereIn('task_id', taskIdsRelatedToOneManagementPlan)
            .patch({
              abandon_date: req.body.abandon_date,
              abandonment_reason: 'OTHER',
              other_abandonment_reason: 'Crop management plan abandoned',
            });
          const taskIdsRelatedToManyManagementPlans = tasksWithManagementPlanCount
            .filter(({ count }) => Number(count) > 1)
            .map(({ task_id }) => task_id);
          //TODO: fix when knex implemented deletion on joined for postgres https://github.com/knex/knex/issues/873
          taskIdsRelatedToManyManagementPlans.length &&
            (await trx.raw(
              'delete from "management_tasks" using "planting_management_plan" where "planting_management_plan"."planting_management_plan_id" = "management_tasks"."planting_management_plan_id" and "planting_management_plan"."management_plan_id" = ? and "management_tasks"."task_id" = ANY(?)',
              [management_plan_id, taskIdsRelatedToManyManagementPlans],
            ));
          return await ManagementPlanModel.query()
            .context(req.auth)
            .where({ management_plan_id })
            .patch(
              lodash.pick(req.body, ['abandon_date', 'complete_notes', 'rating', 'abandon_reason']),
            );
        });

        if (result) {
          return res.sendStatus(200);
        } else {
          return res.sendStatus(404);
        }
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  updateManagementPlan() {
    return async (req, res) => {
      try {
        const management_plan_id = req.params.management_plan_id;
        const { name, notes } = req.body;
        const {
          estimated_yield,
          estimated_yield_unit,
          estimated_revenue,
          estimated_price_per_mass,
          estimated_price_per_mass_unit,
        } = req.body?.crop_management_plan || {};
        const crop_management_plan = {
          estimated_yield,
          estimated_yield_unit,
          estimated_revenue,
          estimated_price_per_mass,
          estimated_price_per_mass_unit,
        };
        const management_plan = { name, notes };
        const result = await ManagementPlanModel.transaction(async (trx) => {
          await ManagementPlanModel.query(trx)
            .context({ user_id: req.auth.user_id })
            .findById(management_plan_id)
            .patch(management_plan)
            .returning('*');
          return await CropManagementPlanModel.query(trx)
            .context(req.auth)
            .findById(management_plan_id)
            .patch(crop_management_plan)
            .returning('*');
        });
        if (result) {
          return res.sendStatus(200);
        } else {
          return res.sendStatus(404);
        }
      } catch (error) {
        console.log(error);

        return res.status(400).json({
          error,
        });
      }
    };
  },

  getManagementPlanByID() {
    return async (req, res) => {
      try {
        const management_plan_id = req.params.management_plan_id;
        const managementPlan = await ManagementPlanModel.query()
          .whereNotDeleted()
          .findById(management_plan_id)
          .withGraphFetched(planGraphFetchedQueryString, graphJoinedOptions);
        return managementPlan
          ? res.status(200).send(removeCropVarietyFromManagementPlan(managementPlan))
          : res.status(404).send('Field crop not found');
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  getManagementPlanByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const managementPlans = await ManagementPlanModel.query()
          .whereNotDeleted()
          .withGraphJoined(planGraphFetchedQueryString, graphJoinedOptions)
          .where('crop_variety.farm_id', farm_id);
        return managementPlans?.length
          ? res.status(200).send(removeCropVarietyFromManagementPlans(managementPlans))
          : res.status(404).send('Field crop not found');
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  getManagementPlansByDate() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const date = req.params.date;
        const managementPlans = await ManagementPlanModel.query()
          .whereNotDeleted()
          .withGraphJoined(planGraphFetchedQueryString, graphJoinedOptions)
          .where('crop_variety.farm_id', farm_id)
          .andWhere('harvest_date', '>=', date);

        return managementPlans?.length
          ? res.status(200).send(removeCropVarietyFromManagementPlans(managementPlans))
          : res.status(404).send('Field crop not found');
      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    };
  },

  getExpiredManagementPlans() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const managementPlans = await ManagementPlanModel.query()
          .whereNotDeleted()
          .withGraphJoined(planGraphFetchedQueryString, graphJoinedOptions)
          .where('crop_variety.farm_id', farm_id)
          .andWhere(raw('harvest_date < now()'));
        return managementPlans?.length
          ? res.status(200).send(removeCropVarietyFromManagementPlans(managementPlans))
          : res.status(404).send('Field crop not found');
      } catch (error) {
        res.status(400).json({ error });
      }
    };
  },
};

const planGraphFetchedQueryString =
  '[crop_variety, crop_management_plan.[planting_management_plans.[bed_method, container_method, broadcast_method, row_method]]]';
const graphJoinedOptions = {
  aliases: {
    crop_management_plan: 'cmp',
    planting_management_plan: 'pmp',
    planting_management_plans: 'pmps',
  },
};

const removeCropVarietyFromManagementPlan = (managementPlan) => {
  !managementPlan.transplant_container && delete managementPlan.transplant_container;
  delete managementPlan.crop_variety;
  for (const plantingType of ['container', 'beds', 'rows', 'broadcast']) {
    !managementPlan.crop_management_plan[plantingType] &&
      delete managementPlan.crop_management_plan[plantingType];
  }
  return managementPlan;
};

const removeCropVarietyFromManagementPlans = (managementPlans) => {
  for (let i = 0; i < managementPlans.length; i++)
    removeCropVarietyFromManagementPlan(managementPlans[i]);
  return managementPlans;
};

export default managementPlanController;
