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

const baseController = require('../controllers/baseController');
const managementPlanModel = require('../models/managementPlanModel');
const cropManagementPlanModel = require('../models/cropManagementPlanModel');
const managementTasksModel = require('../models/managementTasksModel');
const taskModel = require('../models/taskModel');
const taskTypeModel = require('../models/taskTypeModel');

const { transaction, Model, raw, ref } = require('objection');

const lodash = require('lodash');

const managementPlanController = {
  addManagementPlan() {
    return async (req, res) => {
      try {
        //TODO: add none getNonModifiable
        const result = await managementPlanModel.transaction(async trx => {
          const management_plan = await managementPlanModel.query(trx).context({ user_id: req.user.user_id }).upsertGraph(
            req.body, { noUpdate: true, noDelete: true, noInsert: ['location', 'crop_variety'] });

          const tasks = [];
          const getTask = (planned_time, task_type_id, task = {}) => {
            return {
              due_date: planned_time,
              planned_time,
              task_type_id,
              owner_user_id: req.user.user_id,
              ...task,
            };
          };
          if (!req.body.crop_management_plan.already_in_ground) {
            const planned_time = req.body.crop_management_plan.plant_date || req.body.crop_management_plan.seed_date;
            const { planting_management_plan_id } = management_plan.crop_management_plan.planting_management_plans.find(
              planting_management_plan => planting_management_plan.planting_task_type === 'PLANT_TASK',
            );

            const plantTaskType = await taskTypeModel.query(trx).where({
              'farm_id': null,
              'task_translation_key': 'PLANT_TASK',
            }).first();
            const plantTask = await taskModel.query(trx).context(req.user).upsertGraph(getTask(planned_time, plantTaskType.task_type_id, { plant_task: { planting_management_plan_id } }));
            tasks.push(plantTask);
          }

          if (req.body.crop_management_plan.needs_transplant) {
            const planned_time = req.body.crop_management_plan.transplant_date;
            const { planting_management_plan_id } = management_plan.crop_management_plan.planting_management_plans.find(
              planting_management_plan => planting_management_plan.planting_task_type === 'TRANSPLANT_TASK',
            );
            //TODO: move get task_type_id to frontend LF-1965
            const transplantTaskType = await taskTypeModel.query(trx).where({
              'farm_id': null,
              'task_translation_key': 'TRANSPLANT_TASK',
            }).first();
            const transplantTask = await taskModel.query(trx).context(req.user).upsertGraph(getTask(planned_time, transplantTaskType.task_type_id, { transplant_task: { planting_management_plan_id } }));
            tasks.push(transplantTask);
          }
          const location_id = management_plan.crop_management_plan.planting_management_plans.find(
            planting_management_plan => management_plan.crop_management_plan.needs_transplant ?
              planting_management_plan.planting_task_type === 'TRANSPLANT_TASK' : planting_management_plan.planting_task_type !== 'TRANSPLANT_TASK').location_id;
          const taskManagementPlansAndLocations = {
            //TODO: already_in_ground && is_wild && !needs_transplant test (pin location)
            locations: [{ location_id }],
            managementPlans: [{ management_plan_id: management_plan.management_plan_id }],
          };
          if (!req.body.crop_management_plan.for_cover && location_id) {
            const planned_time = req.body.crop_management_plan.harvest_date;
            const harvestTaskType = await taskTypeModel.query(trx).where({
              'farm_id': null,
              'task_translation_key': 'HARVEST_TASK',
            }).first();
            const harvestTask = await taskModel.query(trx).context(req.user).upsertGraph(getTask(planned_time, harvestTaskType.task_type_id, { harvest_task: { harvest_everything: true }, ...taskManagementPlansAndLocations }), {
              relate: ['locations', 'managementPlans'],
            });
            tasks.push(harvestTask);
          } else if (location_id) {
            const planned_time = req.body.crop_management_plan.termination_date;
            const fieldWorkTaskType = await taskTypeModel.query(trx).where({
              'farm_id': null,
              'task_translation_key': 'FIELD_WORK_TASK',
            }).first();
            const fieldWorkTask = await taskModel.query(trx).context(req.user).upsertGraph(getTask(planned_time, fieldWorkTaskType.task_type_id, { field_work_task: { type: 'TERMINATION' }, ...taskManagementPlansAndLocations }), {
              relate: ['locations', 'managementPlans'],
            });
            tasks.push(fieldWorkTask);
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
        const isDeleted = await managementPlanModel.query().context(req.user).where({ management_plan_id: req.params.management_plan_id }).delete();
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
        const result = await managementPlanModel.query().context(req.user).where({ management_plan_id: req.params.management_plan_id }).patch(lodash.pick(req.body, ['complete_date', 'complete_notes', 'rating']));
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
        const result = await managementPlanModel.transaction(async trx => {
          /**
           * Get all related task_ids and number of related management plans of each task_id
           * @type {{task_id: string, count: string}[]}
           */
          const tasksWithManagementPlanCount = await managementTasksModel.query().where({ management_plan_id }).distinct('task_id')
            .then(tasks => managementTasksModel.query().whereIn('task_id', tasks.map(({ task_id }) => task_id))
              .groupBy('task_id').count('management_plan_id').select('task_id'));

          const taskIdsRelatedToOneManagementPlan = tasksWithManagementPlanCount.filter(({ count }) => count === '1')
            .map(({ task_id }) => task_id);
          const abandonedTasks = await taskModel.query(trx).context(req.user)
            .whereIn('task_id', taskIdsRelatedToOneManagementPlan)
            .patch({
              abandoned_time: req.body.abandon_date,
              abandonment_reason: 'OTHER',
              other_abandonment_reason: 'Crop management plan abandoned',
            });
          const taskIdsRelatedToManyManagementPlans = tasksWithManagementPlanCount.filter(({ count }) => Number(count) > 1).map(({ task_id }) => task_id);
          const deletedManagementPlans = await managementTasksModel.query(trx).context(req.user)
            .where({ management_plan_id })
            .whereIn('task_id', taskIdsRelatedToManyManagementPlans)
            .delete();
          return await managementPlanModel.query().context(req.user).where({ management_plan_id }).patch(lodash.pick(req.body, ['abandon_date', 'complete_notes', 'rating', 'abandon_reason']));
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
        const { estimated_yield, estimated_yield_unit } = req.body?.crop_management_plan || {};
        const crop_management_plan = { estimated_yield, estimated_yield_unit };
        const management_plan = { name, notes };
        const result = await managementPlanModel.transaction(async trx => {
          const managementPlan = await managementPlanModel.query(trx)
            .context({ user_id: req.user.user_id })
            .findById(management_plan_id)
            .patch(management_plan).returning('*');
          return await cropManagementPlanModel.query(trx).context(req.user).findById(management_plan_id).patch(crop_management_plan).returning('*');
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
        const managementPlan = await managementPlanModel.query().whereNotDeleted().findById(management_plan_id)
          .withGraphFetched(planGraphFetchedQueryString, graphJoinedOptions);
        return managementPlan ? res.status(200).send(removeCropVarietyFromManagementPlan(managementPlan)) : res.status(404).send('Field crop not found');
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
        const managementPlans = await managementPlanModel.query().whereNotDeleted()
          .withGraphJoined(planGraphFetchedQueryString, graphJoinedOptions)
          .where('crop_variety.farm_id', farm_id);
        return managementPlans?.length ? res.status(200).send(removeCropVarietyFromManagementPlans(managementPlans)) : res.status(404).send('Field crop not found');
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
        const managementPlans = await managementPlanModel.query().whereNotDeleted()
          .withGraphJoined(planGraphFetchedQueryString, graphJoinedOptions)
          .where('crop_variety.farm_id', farm_id)
          .andWhere('harvest_date', '>=', date);


        return managementPlans?.length ? res.status(200).send(removeCropVarietyFromManagementPlans(managementPlans)) : res.status(404).send('Field crop not found');
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
        const managementPlans = await managementPlanModel.query().whereNotDeleted()
          .withGraphJoined(planGraphFetchedQueryString, graphJoinedOptions)
          .where('crop_variety.farm_id', farm_id)
          .andWhere(raw('harvest_date < now()'));
        return managementPlans?.length ? res.status(200).send(removeCropVarietyFromManagementPlans(managementPlans)) : res.status(404).send('Field crop not found');
      } catch (error) {
        res.status(400).json({ error });
      }
    };
  },
};

const planGraphFetchedQueryString = '[crop_variety, crop_management_plan.[planting_management_plans.[bed_method, container_method, broadcast_method, row_method]]]';
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
    !managementPlan.crop_management_plan[plantingType] && delete managementPlan.crop_management_plan[plantingType];
  }
  return managementPlan;
};

const removeCropVarietyFromManagementPlans = (managementPlans) => {
  for (let i = 0; i < managementPlans.length; i++) removeCropVarietyFromManagementPlan(managementPlans[i]);
  return managementPlans;
};

module.exports = managementPlanController;
