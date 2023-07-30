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

import TaskModel from '../models/taskModel.js';

import UserFarmModel from '../models/userFarmModel.js';
import ManagementPlanModel from '../models/managementPlanModel.js';
import PlantingManagementPlanModel from '../models/plantingManagementPlanModel.js';
import ManagementTasksModel from '../models/managementTasksModel.js';
import TransplantTaskModel from '../models/transplantTaskModel.js';
import PlantTaskModel from '../models/plantTaskModel.js';
import HarvestUse from '../models/harvestUseModel.js';
import NotificationUser from '../models/notificationUserModel.js';
import User from '../models/userModel.js';
import { typesOfTask } from './../middleware/validation/task.js';
import IrrigationTypesModel from '../models/irrigationTypesModel.js';
import FieldWorkTypeModel from '../models/fieldWorkTypeModel.js';
import locationDefaultsModel from '../models/locationDefaultsModel.js';
import TaskTypeModel from '../models/taskTypeModel.js';
const adminRoles = [1, 2, 5];
// const isDateInPast = (date) => {
//   const today = new Date();
//   const newDate = new Date(date);
//   if (newDate.setUTCHours(0, 0, 0, 0) < today.setUTCHours(0, 0, 0, 0)) {
//     return true;
//   }
//   return false;
// };

const taskController = {
  async assignTask(req, res) {
    try {
      const { task_id } = req.params;
      const { farm_id } = req.headers;
      const { user_id } = req.auth;
      const { assignee_user_id: newAssigneeUserId } = req.body;
      const { assignee_user_id: oldAssigneeUserId, task_translation_key } = req.checkTaskStatus;

      // Avoid 1) making an empty update, and 2) sending a redundant notification.
      if (oldAssigneeUserId === newAssigneeUserId) return res.sendStatus(200);

      const result = await TaskModel.assignTask(task_id, newAssigneeUserId, req.auth);

      if (!result) return res.status(404).send('Task not found');

      await sendTaskReassignedNotifications(
        task_id,
        newAssigneeUserId,
        oldAssigneeUserId,
        task_translation_key,
        farm_id,
        user_id,
      );

      if (newAssigneeUserId === null) {
        const farmManagementObjs = await UserFarmModel.getFarmManagementByFarmId(farm_id);
        const farmManagement = farmManagementObjs.map((obj) => obj.user_id);
        await sendTaskNotification(
          farmManagement,
          user_id,
          task_id,
          TaskNotificationTypes.TASK_UNASSIGNED,
          task_translation_key,
          farm_id,
        );
      }

      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  },

  async assignAllTasksOnDate(req, res) {
    try {
      const { farm_id } = req.headers;
      const { user_id } = req.auth;
      const { assignee_user_id: newAssigneeUserId, date } = req.body;
      const {
        assignee_user_id: oldAssigneeUserId,
        task_translation_key: currentTaskTranslationKey,
      } = req.checkTaskStatus;
      const { task_id: current_task_id } = req.params;
      const tasks = await getTasksForFarm(farm_id);
      const taskIds = tasks.map(({ task_id }) => task_id);
      let updatedTask;

      // if the current task was not previously unassigned or assigned to the same user,
      // assign the current task to newAssigneeUserId
      if (oldAssigneeUserId !== null && oldAssigneeUserId !== newAssigneeUserId) {
        updatedTask = await TaskModel.assignTask(current_task_id, newAssigneeUserId, req.auth);

        if (!updatedTask) return res.status(404).send('Task not found');

        await sendTaskReassignedNotifications(
          current_task_id,
          newAssigneeUserId,
          oldAssigneeUserId,
          currentTaskTranslationKey,
          farm_id,
          user_id,
        );
      }

      // assign all other unassigned tasks due on this day to newAssigneeUserId
      const available_tasks = await TaskModel.getAvailableTasksOnDate(taskIds, date, req.auth);
      const availableTaskIds = available_tasks.map(({ task_id }) => task_id);
      const result = await TaskModel.assignTasks(availableTaskIds, newAssigneeUserId, req.auth);
      if (result) {
        await Promise.all(
          available_tasks.map(async (task) => {
            await sendTaskNotification(
              [newAssigneeUserId],
              user_id,
              task.task_id,
              TaskNotificationTypes.TASK_ASSIGNED,
              task.task_translation_key,
              farm_id,
            );
          }),
        );
        return res
          .status(200)
          .send(updatedTask ? [...available_tasks, updatedTask] : available_tasks);
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
      // const isPast = await isDateInPast(due_date);
      // if (isPast) {
      //   return res.status(400).send('Task due date must be today or in the future');
      // }

      //Ensure only adminRoles can modify task due date
      if (!adminRoles.includes(req.role)) {
        return res.status(403).send('Not authorized to change due date');
      }

      const result = await TaskModel.query()
        .context(req.auth)
        .findById(task_id)
        .patch({ due_date });
      return result ? res.sendStatus(200) : res.status(404).send('Task not found');
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  },

  async patchWage(req, res) {
    try {
      const { task_id } = req.params;
      const { wage_at_moment } = req.body;

      const result = await TaskModel.query()
        .context(req.auth)
        .findById(task_id)
        .patch({ wage_at_moment, override_hourly_wage: true });
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

      const checkTaskStatus = await TaskModel.getTaskStatus(task_id);
      if (checkTaskStatus.complete_date || checkTaskStatus.abandon_date) {
        return res.status(400).send('Task has already been completed or abandoned');
      }

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
        const assigneeUserFarm = await UserFarmModel.query()
          .where({ user_id: assignee_user_id, farm_id })
          .first();
        wage = assigneeUserFarm.wage;
      }

      const result = await TaskModel.query()
        .context(req.auth)
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
      if (!result) return res.status(404).send('Task not found');

      await sendTaskNotification(
        [assignee_user_id],
        user_id,
        task_id,
        TaskNotificationTypes.TASK_ABANDONED,
        checkTaskStatus.task_translation_key,
        farm_id,
      );

      return res.status(200).send(result);
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
        let data = req.body;
        const { user_id } = req.auth;
        data.owner_user_id = user_id;

        // Filter out deleted management plans from task
        if (data.managementPlans && data.managementPlans.length > 0) {
          const plantingManagementPlanIds = data.managementPlans.map(
            ({ planting_management_plan_id }) => planting_management_plan_id,
          );

          const plantingManagementPlans = await PlantingManagementPlanModel.query()
            .context(req.auth)
            .whereIn('planting_management_plan_id', plantingManagementPlanIds);

          const managementPlanIds = plantingManagementPlans.map(
            ({ management_plan_id }) => management_plan_id,
          );

          const validManagementPlans = await ManagementPlanModel.query()
            .context(req.auth)
            .whereIn('management_plan_id', managementPlanIds)
            .where('deleted', false);

          const validManagementPlanIds = validManagementPlans.map(
            ({ management_plan_id }) => management_plan_id,
          );

          // Return error if task is associated with only a deleted plan
          if (validManagementPlanIds.length === 0) {
            return res.status(404).send('Management plan not found');
          }

          const validPlantingMangementPlans = plantingManagementPlans
            .filter(({ management_plan_id }) => validManagementPlanIds.includes(management_plan_id))
            .map(({ planting_management_plan_id }) => planting_management_plan_id);

          data.managementPlans = data.managementPlans.filter(({ planting_management_plan_id }) =>
            validPlantingMangementPlans.includes(planting_management_plan_id),
          );
        }

        data = await this.checkCustomDependencies(typeOfTask, data, req.headers.farm_id);
        const result = await TaskModel.transaction(async (trx) => {
          const { task_id } = await TaskModel.query(trx)
            .context({ user_id: req.auth.user_id })
            .upsertGraph(data, {
              noUpdate: true,
              noDelete: true,
              noInsert: nonModifiable,
              relate: ['locations', 'managementPlans'],
            });
          const [task] = await TaskModel.query(trx)
            .withGraphFetched(
              `
          [locations.[location_defaults], managementPlans, taskType, soil_amendment_task, irrigation_task.[irrigation_type],scouting_task,
          field_work_task.[field_work_task_type], cleaning_task, pest_control_task, soil_task, harvest_task, plant_task]
          `,
            )
            .where({ task_id });
          return removeNullTypes(task);
        });
        if (result.assignee_user_id) {
          const { assignee_user_id, task_id, taskType } = result;
          await sendTaskNotification(
            [assignee_user_id],
            user_id,
            task_id,
            TaskNotificationTypes.TASK_ASSIGNED,
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

  async checkCustomDependencies(typeOfTask, data, farm_id) {
    switch (typeOfTask) {
      case 'field_work_task': {
        return await this.checkAndAddCustomFieldWork(data, farm_id);
      }
      case 'irrigation_task':
        return await (async () => {
          if (data.irrigation_task) {
            const {
              irrigation_type_id,
            } = await IrrigationTypesModel.checkAndAddCustomIrrigationType(data, farm_id);
            if (data.irrigation_task.default_irrigation_task_type_measurement) {
              await IrrigationTypesModel.updateIrrigationType({
                irrigation_type_id,
                irrigation_type_name: data.irrigation_task.irrigation_type_name,
                default_measuring_type: data.irrigation_task.measuring_type,
                user_id: data.owner_user_id,
              });
            }
            data.irrigation_task.irrigation_type_id = irrigation_type_id;
          }
          if (data.location_defaults && data.location_defaults[0]?.irrigation_task_type) {
            await locationDefaultsModel.createOrUpdateLocationDefaults({
              ...data.location_defaults[0],
              irrigation_type_id: data.irrigation_task.irrigation_type_id,
              user_id: data.owner_user_id,
            });
          }
          delete data.location_defaults;
          return data;
        })();
      default: {
        return data;
      }
    }
  },

  async checkAndAddCustomFieldWork(data, farm_id) {
    if (!data.field_work_task) return data;

    const containsFieldWorkTask = Object.prototype.hasOwnProperty.call(
      data.field_work_task,
      'field_work_task_type',
    );
    if (containsFieldWorkTask && typeof data.field_work_task.field_work_task_type !== 'number') {
      const field_work_task_type = data.field_work_task.field_work_task_type;
      let row;
      if (!field_work_task_type.field_work_name) {
        row = {
          farm_id,
          field_work_name: field_work_task_type,
          field_work_type_translation_key: field_work_task_type.toUpperCase().trim(),
          created_by_user_id: data.owner_user_id,
          updated_by_user_id: data.owner_user_id,
        };
      } else {
        row = {
          farm_id,
          field_work_name: field_work_task_type.field_work_name,
          field_work_type_translation_key: field_work_task_type.field_work_name
            .toUpperCase()
            .trim(),
          created_by_user_id: data.owner_user_id,
          updated_by_user_id: data.owner_user_id,
        };
      }
      const fieldWork = await FieldWorkTypeModel.insertCustomFieldWorkType(row);
      delete data.field_work_task.field_work_task_type;
      data.field_work_task.field_work_type_id = fieldWork.field_work_type_id;
    } else if (containsFieldWorkTask) {
      data.field_work_task.field_work_type_id = data.field_work_task.field_work_task_type;
      delete data.field_work_task.field_work_task_type;
    }
    return data;
  },

  async createHarvestTasks(req, res) {
    try {
      const nonModifiable = getNonModifiable('harvest_task');
      const harvest_tasks = req.body;
      const { farm_id } = req.headers;
      const { user_id } = req.auth;

      const result = await TaskModel.transaction(async (trx) => {
        const result = [];
        let taskTypeTranslation = '';
        for (const harvest_task of harvest_tasks) {
          harvest_task.owner_user_id = user_id;
          if (harvest_task.assignee_user_id && !harvest_task.wage_at_moment) {
            const { wage } = await UserFarmModel.query()
              .where({
                user_id: harvest_task.assignee_user_id,
                farm_id,
              })
              .first();
            harvest_task.wage_at_moment = wage.amount;
          }

          const task = await TaskModel.query(trx)
            .context({ user_id: req.auth.user_id })
            .upsertGraph(harvest_task, {
              noUpdate: true,
              noDelete: true,
              noInsert: nonModifiable,
              relate: ['locations', 'managementPlans'],
            });

          if (task.assignee_user_id) {
            const {
              assignee_user_id,
              harvest_task: { task_id },
              task_type_id,
            } = task;
            if (!taskTypeTranslation) {
              taskTypeTranslation = await TaskTypeModel.getTaskTranslationKeyById(task_type_id);
            }
            await sendTaskNotification(
              [assignee_user_id],
              user_id,
              task_id,
              TaskNotificationTypes.TASK_ASSIGNED,
              taskTypeTranslation.task_translation_key,
              req.headers.farm_id,
            );
          }

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
      const { user_id } = req.auth;

      const result = await TaskModel.transaction(async (trx) => {
        transplant_task.owner_user_id = user_id;
        if (transplant_task.assignee_user_id && !transplant_task.wage_at_moment) {
          const { wage } = await UserFarmModel.query()
            .where({
              user_id: transplant_task.assignee_user_id,
              farm_id,
            })
            .first();
          transplant_task.wage_at_moment = wage.amount;
        }
        //TODO: noInsert on planting_management_plan planting methods LF-1864
        return await TaskModel.query(trx)
          .context({ user_id: req.auth.user_id })
          .upsertGraph(transplant_task, {
            noUpdate: true,
            noDelete: true,
            noInsert: nonModifiable,
          });
      });

      if (result.assignee_user_id) {
        const { assignee_user_id, task_id, task_type_id } = result;
        const taskTypeTranslation = await TaskTypeModel.getTaskTranslationKeyById(task_type_id);
        await sendTaskNotification(
          [assignee_user_id],
          user_id,
          task_id,
          TaskNotificationTypes.TASK_ASSIGNED,
          taskTypeTranslation.task_translation_key,
          req.headers.farm_id,
        );
      }

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
        let data = req.body;
        const { farm_id } = req.headers;
        const { user_id } = req.auth;
        const { task_id } = req.params;
        const {
          assignee_user_id,
          assignee_role_id,
          wage_at_moment,
          override_hourly_wage,
        } = await TaskModel.getTaskAssignee(task_id);
        const { role_id } = await UserFarmModel.getUserRoleId(user_id);
        if (!canCompleteTask(assignee_user_id, assignee_role_id, user_id, role_id)) {
          return res.status(403).send("Not authorized to complete other people's task");
        }
        const { wage } = await UserFarmModel.query()
          .where({ user_id: assignee_user_id, farm_id })
          .first();
        const wagePatchData = override_hourly_wage
          ? { wage_at_moment }
          : { wage_at_moment: wage.amount };
        data = await this.checkCustomDependencies(
          typeOfTask,
          { ...data, owner_user_id: user_id },
          req.headers.farm_id,
        );
        const result = await TaskModel.transaction(async (trx) => {
          const task = await TaskModel.query(trx)
            .context({ user_id: req.auth.user_id })
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
          const taskType = await TaskModel.getTaskType(task_id);
          await sendTaskNotification(
            [assignee_user_id],
            user_id,
            task_id,
            TaskNotificationTypes.TASK_COMPLETED_BY_OTHER_USER,
            taskType.task_translation_key,
            farm_id,
          );
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
      const { user_id } = req.auth;
      const { farm_id } = req.headers;
      const task_id = parseInt(req.params.task_id);
      const { assignee_user_id, assignee_role_id } = await TaskModel.getTaskAssignee(task_id);
      const { role_id } = await UserFarmModel.getUserRoleId(user_id);
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
        const { task_translation_key } = await TaskModel.getTaskType(task_id);
        await sendTaskNotification(
          [assignee_user_id],
          user_id,
          task_id,
          TaskNotificationTypes.TASK_COMPLETED_BY_OTHER_USER,
          task_translation_key,
          farm_id,
        );
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
          `[locations.[location_defaults], managementPlans, soil_amendment_task, field_work_task.[field_work_task_type], cleaning_task, pest_control_task, 
            harvest_task.[harvest_use], plant_task, transplant_task, irrigation_task.[irrigation_type]]
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

  async getFieldWorkTypes(req, res) {
    const { farm_id } = req.params;
    try {
      const farmTypes = await FieldWorkTypeModel.getAllFieldWorkTypesByFarmId(farm_id);
      res.status(200).json(farmTypes);
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error });
    }
  },
  async getIrrigationTaskTypes(req, res) {
    const { farm_id } = req.params;
    try {
      const irrigationTaskTypes = await IrrigationTypesModel.getAllIrrigationTaskTypesByFarmId(
        farm_id,
      );
      res.status(200).json(irrigationTaskTypes);
    } catch (error) {
      return res.status(400).send(error);
    }
  },
  async deleteTask(req, res) {
    try {
      const { task_id } = req.params;
      const { user_id, farm_id } = req.headers;

      const checkTaskStatus = await TaskModel.getTaskStatus(task_id);
      if (checkTaskStatus.complete_date || checkTaskStatus.abandon_date) {
        return res.status(400).send('Task has already been completed or abandoned');
      }

      const result = await TaskModel.deleteTask(task_id, req.auth);
      if (!result) return res.status(404).send('Task not found');

      await sendTaskNotification(
        [result.assignee_user_id],
        user_id,
        task_id,
        TaskNotificationTypes.TASK_DELETED,
        checkTaskStatus.task_translation_key,
        farm_id,
      );

      return res.status(200).send(result);
    } catch (error) {
      return res.status(400).json({ error });
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
    PlantTaskModel.query()
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
    TransplantTaskModel.query()
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
      return PlantTaskModel.query()
        .join(
          'planting_management_plan',
          'plant_task.planting_management_plan_id',
          'planting_management_plan.planting_management_plan_id',
        )
        .where({ task_id })
        .select('*');

    case 'transplant_task':
      return TransplantTaskModel.query()
        .join(
          'planting_management_plan',
          'transplant_task.planting_management_plan_id',
          'planting_management_plan.planting_management_plan_id',
        )
        .where({ task_id })
        .select('*');
    default:
      return ManagementTasksModel.query()
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
    await ManagementPlanModel.query(trx)
      .context(req.auth)
      .patch({ start_date: task.complete_date })
      .whereIn('management_plan_id', management_plan_ids)
      .where('start_date', null)
      .returning('*');
  }
}

export const TaskNotificationTypes = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_ABANDONED: 'TASK_ABANDONED',
  TASK_REASSIGNED: 'TASK_REASSIGNED',
  TASK_COMPLETED_BY_OTHER_USER: 'TASK_COMPLETED_BY_OTHER_USER',
  TASK_UNASSIGNED: 'TASK_UNASSIGNED',
  TASK_DELETED: 'TASK_DELETED',
};

const TaskNotificationUserTypes = {
  TASK_ASSIGNED: 'assigner',
  TASK_ABANDONED: 'abandoner',
  TASK_REASSIGNED: 'assigner',
  TASK_COMPLETED_BY_OTHER_USER: 'assigner',
  TASK_UNASSIGNED: 'editor',
  TASK_DELETED: 'abandoner',
};

/**
 * Sends a notification to the specified receivers about a task
 * @param {Array<uuid>} receiverIds
 * @param {String} usernameVariableId
 * @param {String} taskId
 * @param {String} notifyTranslationKey
 * @param {String} taskTranslationKey
 * @param {String} farmId
 * @return {Promise<void>}
 */
export async function sendTaskNotification(
  receiverIds,
  usernameVariableId,
  taskId,
  notifyTranslationKey,
  taskTranslationKey,
  farmId,
) {
  const filteredReceiverIds = receiverIds.filter((id) => id !== null && id !== undefined);
  if (filteredReceiverIds.length === 0) return;

  const userName = await User.getNameFromUserId(usernameVariableId);
  await NotificationUser.notify(
    {
      title: {
        translation_key: `NOTIFICATION.${TaskNotificationTypes[notifyTranslationKey]}.TITLE`,
      },
      body: { translation_key: `NOTIFICATION.${TaskNotificationTypes[notifyTranslationKey]}.BODY` },
      variables: [
        { name: 'taskType', value: `task:${taskTranslationKey}`, translate: true },
        {
          name: TaskNotificationUserTypes[notifyTranslationKey],
          value: userName,
          translate: false,
        },
      ],
      ref: { entity: { type: 'task', id: taskId } },
      context: { task_translation_key: taskTranslationKey },
      farm_id: farmId,
    },
    filteredReceiverIds,
  );
}

/**
 * Sends notifications to the new assignee and old assignee of a task that was reassigned
 * @param taskId {uuid} - uuid of the task
 * @param newAssigneeUserId {uuid} - uuid of the user who is being assigned the task
 * @param oldAssigneeUserId {uuid} - uuid of the user was previously assigned the task
 * @param taskTranslationKey {String} - a key for translating languages
 * @param farmId {uuid} - uuid of the farm
 * @param assignerUserId - {uuid} uuid of the user who assigned the task
 */
async function sendTaskReassignedNotifications(
  taskId,
  newAssigneeUserId,
  oldAssigneeUserId,
  taskTranslationKey,
  farmId,
  assignerUserId,
) {
  await Promise.all([
    sendTaskNotification(
      [newAssigneeUserId],
      assignerUserId,
      taskId,
      TaskNotificationTypes.TASK_ASSIGNED,
      taskTranslationKey,
      farmId,
    ),
    sendTaskNotification(
      [oldAssigneeUserId],
      assignerUserId,
      taskId,
      TaskNotificationTypes.TASK_REASSIGNED,
      taskTranslationKey,
      farmId,
    ),
  ]);
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

export default taskController;

export { getTasksForFarm };
