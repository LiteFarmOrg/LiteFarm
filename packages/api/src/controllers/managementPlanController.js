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
import UserFarmModel from '../models/userFarmModel.js';
import objection, { raw } from 'objection';
import _pick from 'lodash/pick.js';
import knex from '../util/knex.js';
import { sendTaskNotification, TaskNotificationTypes } from './taskController.js';
import {
  getDatesFromManagementPlanGraph,
  getManagementPlanGroupTemplateGraph,
  getFormattedManagementPlanData,
} from '../util/copyCropPlan.js';
import { getSortedDates } from '../util/util.js';
const { transaction, Model } = objection;

const managementPlanController = {
  repeatManagementPlan() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const { start_dates, management_plan_id, repeat_details } = req.body;
      try {
        if (!start_dates?.length > 0 || !management_plan_id || !repeat_details?.crop_plan_name) {
          throw 'Insufficient details to copy crop plan';
        }
        if (start_dates?.length > 20) {
          throw 'Cannot create more than 20 repetitions at a time';
        }
        const createdByUser = req.auth.user_id;

        // Get source management plan entire graph acting as a template
        const managementPlanGraph = await ManagementPlanModel.query(trx)
          .where('management_plan_id', management_plan_id)
          .withGraphFetched(
            'crop_management_plan.[planting_management_plans.[managementTasks.[task.[pest_control_task, irrigation_task, scouting_task, soil_task, soil_amendment_task, field_work_task, harvest_task, cleaning_task, locationTasks]], plant_task.[task.[locationTasks]], transplant_task.[task.[locationTasks]], bed_method, container_method, broadcast_method, row_method]]',
          )
          .modifyGraph(
            'crop_management_plan.[planting_management_plans.managementTasks]',
            (builder) => {
              builder
                .join('task', 'management_tasks.task_id', 'task.task_id')
                .where('task.deleted', 'false');
            },
          )
          .modifyGraph('crop_management_plan.[planting_management_plans.plant_task]', (builder) => {
            builder
              .join('task', 'plant_task.task_id', 'task.task_id')
              .where('task.deleted', 'false');
          })
          .modifyGraph(
            'crop_management_plan.[planting_management_plans.transplant_task]',
            (builder) => {
              builder
                .join('task', 'transplant_task.task_id', 'task.task_id')
                .where('task.deleted', 'false');
            },
          )
          .whereNotDeleted()
          .first();

        if (!managementPlanGraph) {
          throw 'Management plan does not exist or is deleted';
        }

        // Only assign tasks if JUST one 'Active' userFarm
        const activeUsers = await UserFarmModel.query(trx)
          .select('user_id', 'wage')
          .where('farm_id', req.headers.farm_id)
          .andWhere('status', 'Active');
        const theOnlyActiveUserFarm = activeUsers.length == 1 ? activeUsers[0] : null;

        // Find the reference date
        const taskDates = getDatesFromManagementPlanGraph(managementPlanGraph);
        const sortedStartDates = getSortedDates(start_dates);
        const firstTaskDate = getSortedDates(taskDates)[0];

        // Future looking piece for LF-3470
        const templateIsPartOfGroup = false;

        //Create an upsert object based on the graphs table columns
        let newManagementPlanGroup = {};
        if (!templateIsPartOfGroup && sortedStartDates.length > 0) {
          //Using the template management plan this returns a really large object containing all data to be inserted
          newManagementPlanGroup = getManagementPlanGroupTemplateGraph(
            createdByUser,
            repeat_details,
            sortedStartDates,
            managementPlanGraph,
            theOnlyActiveUserFarm,
            firstTaskDate,
          );
        } else {
          throw 'Currently template plan cannot be part of the newly created group';
        }

        //Upsert management group
        const managementPlanGroup = await ManagementPlanGroup.query(trx)
          .context({ user_id: req.auth.user_id })
          .upsertGraph(newManagementPlanGroup, {
            noUpdate: true,
            noDelete: true,
            noInsert: ['location', 'crop_variety'],
            insertMissing: true,
          });

        //Format return data
        const result = getFormattedManagementPlanData(managementPlanGroup);

        await trx.commit();
        return res.status(201).send(result);
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
          // Upsert management plan graph
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
        const { management_plan_id } = req.params;

        const managementPlan = await ManagementPlanModel.query()
          .context(req.auth)
          .where({ management_plan_id })
          .where('deleted', false)
          .first();

        if (!managementPlan) {
          return res.status(404).send('Management plan not found');
        }

        const result = await ManagementPlanModel.transaction(async (trx) => {
          const tasksWithManagementPlanCount = await ManagementTasksModel.query(trx)
            .select('*')
            .join(
              'planting_management_plan',
              'planting_management_plan.planting_management_plan_id',
              'management_tasks.planting_management_plan_id',
            )
            .where('planting_management_plan.management_plan_id', management_plan_id)
            .distinct('task_id')
            .then((tasks) =>
              ManagementTasksModel.query(trx)
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

          const transplantTasks = await TransplantTaskModel.query(trx)
            .select('*')
            .join(
              'planting_management_plan',
              'planting_management_plan.planting_management_plan_id',
              'transplant_task.planting_management_plan_id',
            )
            .join('task', 'task.task_id', 'transplant_task.task_id')
            .whereNull('task.complete_date')
            .where('planting_management_plan.management_plan_id', management_plan_id);

          const plantTasks = await PlantTaskModel.query(trx)
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
            .delete();
          const taskIdsRelatedToManyManagementPlans = tasksWithManagementPlanCount
            .filter(({ count }) => Number(count) > 1)
            .map(({ task_id }) => task_id);

          // If a task is associated with more than one management plan, the record is deleted from management_tasks but the task is not deleted
          // Raw because knex does not allow delete join, see: https://github.com/knex/knex/issues/873
          taskIdsRelatedToManyManagementPlans.length &&
            (await trx.raw(
              'delete from "management_tasks" using "planting_management_plan" where "planting_management_plan"."planting_management_plan_id" = "management_tasks"."planting_management_plan_id" and "planting_management_plan"."management_plan_id" = ? and "management_tasks"."task_id" = ANY(?)',
              [management_plan_id, taskIdsRelatedToManyManagementPlans],
            ));

          return await ManagementPlanModel.query(trx)
            .context(req.auth)
            .where({ management_plan_id })
            .delete();
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

  completeManagementPlan() {
    return async (req, res) => {
      try {
        const result = await ManagementPlanModel.query()
          .context(req.auth)
          .where({ management_plan_id: req.params.management_plan_id })
          .patch(_pick(req.body, ['complete_date', 'complete_notes', 'rating']));
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

        const managementPlan = await ManagementPlanModel.query()
          .context(req.auth)
          .where({ management_plan_id })
          .where('deleted', false)
          .first();

        if (!managementPlan) {
          return res.status(404).send('Management plan not found');
        }

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
            .patch(_pick(req.body, ['abandon_date', 'complete_notes', 'rating', 'abandon_reason']));
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

        const managementPlan = await ManagementPlanModel.query()
          .context(req.auth)
          .where({ management_plan_id })
          .where('deleted', false)
          .first();

        if (!managementPlan) {
          return res.status(404).send('Management plan not found');
        }

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
        const harvestedPlans = await getHarvestedToDate(
          managementPlans.map((mp) => mp.management_plan_id),
        );
        const transformedPlans = appendHarvestedToDate(
          removeCropVarietyFromManagementPlans(managementPlans),
          harvestedPlans,
        );
        return managementPlans?.length
          ? res.status(200).send(transformedPlans)
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
  '[crop_variety, management_plan_group, crop_management_plan.[planting_management_plans.[bed_method, container_method, broadcast_method, row_method]]]';
const graphJoinedOptions = {
  aliases: {
    crop_management_plan: 'cmp',
    planting_management_plan: 'pmp',
    planting_management_plans: 'pmps',
    management_plan_group: 'mpg',
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

// function to add harvested_to_date to management plans that have it.
const appendHarvestedToDate = (managementPlans, plansWithHarvest) => {
  return managementPlans.map((mp) => {
    const harvest = plansWithHarvest
      ? plansWithHarvest.find((pwh) => pwh.management_plan_id === mp.management_plan_id)
      : null;
    mp.harvested_to_date = harvest ? harvest.harvested_to_date : null;
    return mp;
  });
};

const getHarvestedToDate = async (managementPlanIds) => {
  return ManagementPlanModel.query()
    .select(knex.raw('SUM(actual_quantity) AS harvested_to_date, mp.management_plan_id'))
    .from('harvest_task as ht')
    .join('task as t', 't.task_id', '=', 'ht.task_id')
    .join('management_tasks as mt', 'mt.task_id', '=', 't.task_id')
    .join(
      'planting_management_plan as pmp',
      'pmp.planting_management_plan_id',
      '=',
      'mt.planting_management_plan_id',
    )
    .join('management_plan as mp', 'pmp.management_plan_id', '=', 'mp.management_plan_id')
    .whereIn('mp.management_plan_id', managementPlanIds)
    .andWhere('t.complete_date', 'IS NOT', null)
    .groupBy('mp.management_plan_id');
};

export default managementPlanController;
