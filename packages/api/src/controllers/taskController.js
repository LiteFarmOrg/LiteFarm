/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

const TaskModel = require('../models/taskModel');
const userFarmModel = require('../models/userFarmModel');
const managementPlanModel = require('../models/managementPlanModel');
const managementTasksModel = require('../models/managementTasksModel');
const transplantTaskModel = require('../models/transplantTaskModel');
const plantTaskModel = require('../models/plantTaskModel');
const HarvestUse = require('../models/harvestUseModel');
const NotificationUser = require('../models/notificationUserModel');
const User = require('../models/userModel');

const { typesOfTask } = require('./../middleware/validation/task');
const adminRoles = [1, 2, 5];
const isDateInPast = (date) => {
  const today = new Date();
  const newDate = new Date(date);
  if (newDate.setUTCHours(0, 0, 0, 0) < today.setUTCHours(0, 0, 0, 0)) {
    return true;
  }
  return false;
};

const taskController = {
  async assignTask(req, res) {
    try {
      const { task_id } = req.params;
      const { farm_id } = req.headers;
      const { assignee_user_id } = req.body;

      const checkTaskStatus = await TaskModel.query()
        .leftOuterJoin('task_type', 'task.task_type_id', 'task_type.task_type_id')
        .select('complete_date', 'abandon_date', 'assignee_user_id', 'task_translation_key')
        .where({ task_id })
        .first();
      if (checkTaskStatus.complete_date || checkTaskStatus.abandon_date) {
        return res.status(400).send('Task has already been completed or abandoned');
      }

      if (
        !adminRoles.includes(req.role) &&
        checkTaskStatus.assignee_user_id != req.user.user_id &&
        checkTaskStatus.assignee_user_id !== null
      ) {
        return res
          .status(403)
          .send('Farm workers are not allowed to reassign a task assigned to another worker');
      }

      // Avoid 1) making an empty update, and 2) sending a redundant notification.
      if (checkTaskStatus.assignee_user_id === assignee_user_id) return res.sendStatus(200);

      const result = await TaskModel.query()
        .context(req.user)
        .findById(task_id)
        .patch({ assignee_user_id });
      if (!result) return res.status(404).send('Task not found');

      await notifyAssignee(
        assignee_user_id,
        task_id,
        checkTaskStatus.task_translation_key,
        farm_id,
      );

      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  },

  async assignAllTasksOnDate(req, res) {
    try {
      const { farm_id } = req.headers;
      const { assignee_user_id, date } = req.body;
      const tasks = await getTasksForFarm(farm_id);
      const taskIds = tasks.map(({ task_id }) => task_id);
      const available_tasks = await TaskModel.query()
        .leftOuterJoin('task_type', 'task.task_type_id', 'task_type.task_type_id')
        .context(req.user)
        .select('task_id', 'task_translation_key')
        .where((builder) => {
          builder.where('due_date', date);
          builder.whereIn('task_id', taskIds);
          if (assignee_user_id !== null) {
            builder.where('assignee_user_id', null);
          }
          builder.where('complete_date', null);
          builder.where('abandon_date', null);
        });
      const availableTaskIds = available_tasks.map(({ task_id }) => task_id);
      const result = await TaskModel.query()
        .context(req.user)
        .patch({
          assignee_user_id,
        })
        .whereIn('task_id', availableTaskIds);
      if (result) {
        available_tasks.forEach(async (task) => {
          await notifyAssignee(assignee_user_id, task.task_id, task.task_translation_key, farm_id);
        });
        return res.status(200).send(available_tasks);
      }
      return res.status(404).send('Tasks not found');
    } catch (error) {
      return res.status(400).json({ error });
    }
  },

  async patchTaskDate(req, res) {
    try {
      const { task_id } = req.params;
      const { due_date } = req.body;

      //Ensure the task due date is not in the past
      const isPast = await isDateInPast(due_date);
      if (isPast) {
        return res.status(400).send('Task due date must be today or in the future');
      }

      //Ensure only adminRoles can modify task due date
      if (!adminRoles.includes(req.role)) {
        return res.status(403).send('Not authorized to change due date');
      }

      const result = await TaskModel.query()
        .context(req.user)
        .findById(task_id)
        .patch({ due_date });
      return result ? res.sendStatus(200) : res.status(404).send('Task not found');
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  },

  async abandonTask(req, res) {
    try {
      const { task_id } = req.params;
      const { user_id, farm_id } = req.headers;
      const {
        abandonment_reason,
        other_abandonment_reason,
        abandonment_notes,
        happiness,
        duration,
        abandon_date,
      } = req.body;

      const {
        owner_user_id,
        assignee_user_id,
        wage_at_moment,
        override_hourly_wage,
      } = await TaskModel.query()
        .select('owner_user_id', 'assignee_user_id', 'wage_at_moment', 'override_hourly_wage')
        .where({ task_id })
        .first();
      const isUserTaskOwner = user_id === owner_user_id;
      const isUserTaskAssignee = user_id === assignee_user_id;
      const hasAssignee = assignee_user_id !== null;
      // TODO: move to middleware
      // cannot abandon task if user is worker and not assignee and not creator
      if (!adminRoles.includes(req.role) && !isUserTaskOwner && !isUserTaskAssignee) {
        return res
          .status(403)
          .send('A worker who is not assignee or owner of task cannot abandon it');
      }
      // cannot abandon an unassigned task with rating or duration
      if (!hasAssignee && (happiness || duration)) {
        return res.status(400).send('An unassigned task should not be rated or have time clocked');
      }

      let wage = { amount: 0 };
      if (assignee_user_id) {
        const assigneeUserFarm = await userFarmModel
          .query()
          .where({ user_id: assignee_user_id, farm_id })
          .first();
        wage = assigneeUserFarm.wage;
      }

      const result = await TaskModel.query()
        .context(req.user)
        .findById(task_id)
        .patch({
          abandon_date,
          abandonment_reason,
          other_abandonment_reason,
          abandonment_notes,
          happiness,
          duration,
          wage_at_moment: override_hourly_wage ? wage_at_moment : wage.amount,
        })
        .returning('*');
      return result ? res.status(200).send(result) : res.status(404).send('Task not found');
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  },

  createTask(typeOfTask) {
    const nonModifiable = getNonModifiable(typeOfTask);
    return async (req, res, next) => {
      try {
        // OC: the "noInsert" rule will not fail if a relationship is present in the graph.
        // it will just ignore the insert on it. This is just a 2nd layer of protection
        // after the validation middleware.
        const data = req.body;
        const { user_id } = req.user;
        data.owner_user_id = user_id;
        const result = await TaskModel.transaction(async (trx) => {
          const { task_id } = await TaskModel.query(trx)
            .context({ user_id: req.user.user_id })
            .upsertGraph(data, {
              noUpdate: true,
              noDelete: true,
              noInsert: nonModifiable,
              relate: ['locations', 'managementPlans'],
            });
          const [task] = await TaskModel.query(trx)
            .withGraphFetched(
              `
          [locations, managementPlans, taskType, soil_amendment_task, irrigation_task,scouting_task,
          field_work_task, cleaning_task, pest_control_task, soil_task, harvest_task, plant_task]
          `,
            )
            .where({ task_id });
          return removeNullTypes(task);
        });
        if (result.assignee_user_id) {
          const { assignee_user_id, task_id, taskType } = result;
          await notifyAssignee(
            assignee_user_id,
            task_id,
            taskType.task_translation_key,
            req.headers.farm_id,
          );
        }
        return res.status(201).send(result);
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    };
  },

  async createHarvestTasks(req, res) {
    try {
      const nonModifiable = getNonModifiable('harvest_task');
      const harvest_tasks = req.body;
      const { farm_id } = req.headers;
      const { user_id } = req.user;

      const result = await TaskModel.transaction(async (trx) => {
        const result = [];
        for (const harvest_task of harvest_tasks) {
          harvest_task.owner_user_id = user_id;
          if (harvest_task.assignee_user_id && !harvest_task.wage_at_moment) {
            const { wage } = await userFarmModel
              .query()
              .where({
                user_id: harvest_task.assignee_user_id,
                farm_id,
              })
              .first();
            harvest_task.wage_at_moment = wage.amount;
          }

          const task = await TaskModel.query(trx)
            .context({ user_id: req.user.user_id })
            .upsertGraph(harvest_task, {
              noUpdate: true,
              noDelete: true,
              noInsert: nonModifiable,
              relate: ['locations', 'managementPlans'],
            });
          // N.B. Notification not needed; these tasks are never assigned at creation.
          result.push(removeNullTypes(task));
        }
        return result;
      });
      return res.status(201).send(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  },

  async createTransplantTask(req, res) {
    try {
      const nonModifiable = getNonModifiable('transplant_task');
      const transplant_task = req.body;
      const { farm_id } = req.headers;
      const { user_id } = req.user;

      const result = await TaskModel.transaction(async (trx) => {
        transplant_task.owner_user_id = user_id;
        if (transplant_task.assignee_user_id && !transplant_task.wage_at_moment) {
          const { wage } = await userFarmModel
            .query()
            .where({
              user_id: transplant_task.assignee_user_id,
              farm_id,
            })
            .first();
          transplant_task.wage_at_moment = wage.amount;
        }
        //TODO: noInsert on planting_management_plan planting methods LF-1864
        return await TaskModel.query(trx)
          .context({ user_id: req.user.user_id })
          .upsertGraph(transplant_task, {
            noUpdate: true,
            noDelete: true,
            noInsert: nonModifiable,
          });
      });
      // N.B. Notification not needed; these tasks are never assigned at creation.
      return res.status(201).send(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  },

  completeTask(typeOfTask) {
    const nonModifiable = getNonModifiable(typeOfTask);
    return async (req, res, next) => {
      try {
        const data = req.body;
        const { farm_id } = req.headers;
        const { user_id } = req.user;
        const { task_id } = req.params;
        const {
          assignee_user_id,
          assignee_role_id,
          wage_at_moment,
          override_hourly_wage,
        } = await TaskModel.getTaskAssignee(task_id);
        const { role_id } = await userFarmModel.getUserRoleId(user_id);
        if (!canCompleteTask(assignee_user_id, assignee_role_id, user_id, role_id)) {
          return res.status(403).send("Not authorized to complete other people's task");
        }
        const { wage } = await userFarmModel
          .query()
          .where({ user_id: assignee_user_id, farm_id })
          .first();
        const wagePatchData = override_hourly_wage
          ? { wage_at_moment }
          : { wage_at_moment: wage.amount };
        const result = await TaskModel.transaction(async (trx) => {
          const task = await TaskModel.query(trx)
            .context({ user_id: req.user.user_id })
            .upsertGraph(
              { task_id: parseInt(task_id), ...data, ...wagePatchData },
              {
                noUpdate: nonModifiable,
                noDelete: true,
                noInsert: true,
              },
            );

          await patchManagementPlanStartDate(trx, req, typeOfTask);

          return task;
        });
        if (result) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send('Task not found');
        }
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    };
  },

  /**
   * Records the completion of a harvest task, and information about the harvest's usage.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  async completeHarvestTask(req, res) {
    try {
      const nonModifiable = getNonModifiable('harvest_task');
      const { user_id } = req.user;
      const task_id = parseInt(req.params.task_id);
      const { assignee_user_id, assignee_role_id } = await TaskModel.getTaskAssignee(task_id);
      const { role_id } = await userFarmModel.getUserRoleId(user_id);
      if (!canCompleteTask(assignee_user_id, assignee_role_id, user_id, role_id)) {
        return res.status(403).send("Not authorized to complete other people's task");
      }
      const result = await TaskModel.transaction(async (trx) => {
        const updated_task = await TaskModel.query(trx)
          .context({ user_id })
          .upsertGraph(
            { task_id, ...req.body.task },
            {
              noUpdate: nonModifiable,
              noDelete: true,
              noInsert: true,
            },
          );
        const result = removeNullTypes(updated_task);
        delete result.harvest_task; // Not needed by front end.

        // Write harvest uses to database.
        const harvest_uses = req.body.harvest_uses.map((harvest_use) => ({
          ...harvest_use,
          task_id,
        }));
        await HarvestUse.query(trx).context({ user_id }).insert(harvest_uses);

        await patchManagementPlanStartDate(trx, req, 'harvest_task', req.body.task);

        return result;
      });

      if (Object.keys(result).length > 0) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send('Task not found');
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error });
    }
  },

  async getTasksByFarmId(req, res) {
    const { farm_id } = req.params;
    try {
      const tasks = await getTasksForFarm(farm_id);
      const taskIds = tasks.map(({ task_id }) => task_id);
      const graphTasks = await TaskModel.query()
        .whereNotDeleted()
        .withGraphFetched(
          `[locations, managementPlans, soil_amendment_task, field_work_task, cleaning_task, pest_control_task, 
            harvest_task.[harvest_use], plant_task, transplant_task]
        `,
        )
        .whereIn('task_id', taskIds);
      const filteredTasks = graphTasks.map(removeNullTypes);
      if (graphTasks) {
        res.status(200).send(filteredTasks);
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error });
    }
  },

  async getHarvestUsesByFarmId(req, res) {
    const { farm_id } = req.params;
    try {
      const harvest_uses = await HarvestUse.query()
        .select()
        .join('task', 'harvest_use.task_id', 'task.task_id')
        .join('location_tasks', 'location_tasks.task_id', 'task.task_id')
        .join('location', 'location.location_id', 'location_tasks.location_id')
        .where('location.farm_id', farm_id);
      if (harvest_uses) {
        return res.status(200).send(harvest_uses);
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error });
    }
  },
};

//TODO: tests where location and management_plan inserts should fail

function getNonModifiable(asset) {
  const nonModifiableAssets = typesOfTask.filter((a) => a !== asset);
  return ['createdByUser', 'updatedByUser', 'location', 'management_plan'].concat(
    nonModifiableAssets,
  );
}

function removeNullTypes(task) {
  const filtered = Object.keys(task)
    .filter((k) => typesOfTask.includes(k))
    .reduce((reducer, k) => ({ ...reducer, [k]: task[k] === null ? undefined : task[k] }), {});
  return { ...task, ...filtered };
}

//TODO: optimize after plant_task and transplant_task refactor
async function getTasksForFarm(farm_id) {
  const [managementTasks, locationTasks, plantTasks, transplantTasks] = await Promise.all([
    TaskModel.query()
      .select('task.task_id')
      .whereNotDeleted()
      .distinct('task.task_id')
      .join('management_tasks', 'management_tasks.task_id', 'task.task_id')
      .join(
        'planting_management_plan',
        'management_tasks.planting_management_plan_id',
        'planting_management_plan.planting_management_plan_id',
      )
      .join(
        'management_plan',
        'planting_management_plan.management_plan_id',
        'management_plan.management_plan_id',
      )
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .where('crop_variety.farm_id', farm_id),
    TaskModel.query()
      .select('task.task_id')
      .whereNotDeleted()
      .distinct('task.task_id')
      .join('location_tasks', 'location_tasks.task_id', 'task.task_id')
      .join('location', 'location.location_id', 'location_tasks.location_id')
      .where('location.farm_id', farm_id),
    plantTaskModel
      .query()
      .select('plant_task.task_id')
      .join(
        'planting_management_plan',
        'planting_management_plan.planting_management_plan_id',
        'plant_task.planting_management_plan_id',
      )
      .join(
        'management_plan',
        'management_plan.management_plan_id',
        'planting_management_plan. management_plan_id',
      )
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .where('crop_variety.farm_id', farm_id),
    transplantTaskModel
      .query()
      .select('transplant_task.task_id')
      .join(
        'planting_management_plan',
        'planting_management_plan.planting_management_plan_id',
        'transplant_task.planting_management_plan_id',
      )
      .join(
        'management_plan',
        'management_plan.management_plan_id',
        'planting_management_plan. management_plan_id',
      )
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .where('crop_variety.farm_id', farm_id),
  ]);
  return [...managementTasks, ...locationTasks, ...plantTasks, ...transplantTasks];
}

async function getManagementPlans(task_id, typeOfTask) {
  switch (typeOfTask) {
    case 'plant_task':
      return plantTaskModel
        .query()
        .join(
          'planting_management_plan',
          'plant_task.planting_management_plan_id',
          'planting_management_plan.planting_management_plan_id',
        )
        .where({ task_id })
        .select('*');

    case 'transplant_task':
      return transplantTaskModel
        .query()
        .join(
          'planting_management_plan',
          'transplant_task.planting_management_plan_id',
          'planting_management_plan.planting_management_plan_id',
        )
        .where({ task_id })
        .select('*');
    default:
      return managementTasksModel
        .query()
        .select('planting_management_plan.management_plan_id')
        .join(
          'planting_management_plan',
          'planting_management_plan.planting_management_plan_id',
          'management_tasks.planting_management_plan_id',
        )
        .where('task_id', task_id);
  }
}

async function patchManagementPlanStartDate(trx, req, typeOfTask, task = req.body) {
  const task_id = parseInt(req.params.task_id);
  const management_plans = await getManagementPlans(task_id, typeOfTask);
  const management_plan_ids = management_plans.map(({ management_plan_id }) => management_plan_id);
  if (management_plan_ids.length > 0) {
    await managementPlanModel
      .query(trx)
      .context(req.user)
      .patch({ start_date: task.complete_date })
      .whereIn('management_plan_id', management_plan_ids)
      .where('start_date', null)
      .returning('*');
  }
}

async function notifyAssignee(userId, taskId, taskTranslationKey, farmId) {
  if (!userId) return;

  const assigneeName = await User.getNameFromUserId(userId);
  NotificationUser.notify(
    {
      translation_key: 'TASK_ASSIGNED',
      variables: [
        { name: 'taskType', value: `task:${taskTranslationKey}`, translate: true },
        { name: 'assignee', value: assigneeName, translate: false },
      ],
      entity_type: TaskModel.tableName,
      entity_id: String(taskId),
      context: { task_translation_key: taskTranslationKey },
      farm_id: farmId,
    },
    [userId],
  );
}

/**
 * Checks if the current user can complete the task.
 * @param assigneeUserId {uuid} - uuid of the task assignee
 * @param assigneeRoleId {number} - role id of assignee
 * @param userId {uuid} - uuid of the user completing the task
 * @param userRoleId {number} - role of the user completing the task
 * @returns {boolean}
 */
function canCompleteTask(assigneeUserId, assigneeRoleId, userId, userRoleId) {
  const isAdmin = adminRoles.includes(userRoleId);
  // 4 is worker without account aka pseudo user
  return assigneeUserId === userId || (assigneeRoleId === 4 && isAdmin);
}

module.exports = taskController;
