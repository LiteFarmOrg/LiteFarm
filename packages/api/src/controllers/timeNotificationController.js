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

const UserFarmModel = require('../models/userFarmModel');
const TaskTypeModel = require('../models/taskTypeModel');
const TaskModel = require('../models/taskModel');
const NotificationUser = require('../models/notificationUserModel');
const { getTasksForFarm } = require('./taskController');

const timeNotificationController = {
  /**
   * Notifies farm management of unassigned tasks due this week.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @async
   */
  async postWeeklyUnassignedTasks(req, res) {
    const { farm_id } = req.params;
    try {
      // All unassigned tasks at the farm associated with farm_id due this week that are
      // not completed or abandoned
      const tasksFromFarm = await getTasksForFarm(farm_id);
      const taskIds = tasksFromFarm.map(({ task_id }) => task_id);

      const unassignedTasks = await TaskModel.getUnassignedTasksDueThiWeekFromIds(taskIds);
      const farmManagementObjs = await UserFarmModel.getFarmManagementByFarmId(farm_id);

      const farmManagement = farmManagementObjs.map(
        (farmManagementObj) => farmManagementObj.user_id,
      );

      if (unassignedTasks.length > 0) {
        const {
          task_translation_key: firstTaskTranslationKey,
        } = await TaskTypeModel.getTaskTranslationKeyById(unassignedTasks[0].task_type_id);

        await sendWeeklyUnassignedTaskNotifications(
          farm_id,
          farmManagement,
          firstTaskTranslationKey,
        );
        return res.status(201).send({ unassignedTasks, farmManagement });
      } else {
        return res.status(200).send({ unassignedTasks, farmManagement });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error });
    }
  },

  /**
   * Notifies all users of a specified farm of tasks due today
   * @param {Request} req request
   * @param {Response} res response
   * @async
   */
  async postDailyDueTodayTasks(req, res) {
    const { farm_id } = req.params;
    try {
      const activeUsers = await UserFarmModel.getActiveUsersFromFarmId(farm_id);

      if (activeUsers && activeUsers.length) {
        const tasksDueTodayNotificationUsers = [];
        for (const { user_id } of activeUsers) {
          const hasTasksDueToday = await TaskModel.hasTasksDueTodayForUserFromFarm(user_id, farm_id);

          if (hasTasksDueToday) {
            await sendDailyDueTodayTaskNotification(
              farm_id,
              user_id,
            );
            tasksDueTodayNotificationUsers.push(user_id);
          }
        }
        return res.status(201).send({ tasksDueTodayNotificationUsers });
      } else {
        return res.status(200).send('No tasks due today for any users.');
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error });
    }
  },
};

/**
 * Notifies farm management of unassigned tasks due this week.
 * @param {String} farmId - id of the farm the farm managers belong to
 * @param {Array} farmManagement - user_ids of FM/FO/EO that need to be notified
 * @param {String} firstTaskTranslationKey - task translation key of the first unassigned task
 * @async
 */
async function sendWeeklyUnassignedTaskNotifications(
  farmId,
  farmManagement,
  firstTaskTranslationKey,
) {
  await NotificationUser.notify(
    {
      title: { translation_key: 'NOTIFICATION.WEEKLY_UNASSIGNED_TASKS.TITLE' },
      body: { translation_key: 'NOTIFICATION.WEEKLY_UNASSIGNED_TASKS.BODY' },
      variables: [],
      ref: { url: '/tasks' },
      context: {
        task_translation_key: firstTaskTranslationKey,
        notification_type: 'WEEKLY_UNASSIGNED_TASKS',
      },
      farm_id: farmId,
    },
    farmManagement,
  );
}

/**
 * Sends notification to a user of tasks due today
 * @param {String} farmId
 * @param {String} userId
 * @async
 */
async function sendDailyDueTodayTaskNotification(
  farmId,
  userId,
) {
  await NotificationUser.notify(
    {
      title: { translation_key: 'NOTIFICATION.DAILY_TASKS_DUE_TODAY.TITLE' },
      body: { translation_key: 'NOTIFICATION.DAILY_TASKS_DUE_TODAY.BODY' },
      variables: [],
      ref: { url: '/tasks' },
      context: {
        task_translation_key: 'FIELD_WORK_TASK',
        notification_type: 'DAILY_TASKS_DUE_TODAY',
      },
      farm_id: farmId,
    },
    [userId],
  );
}

module.exports = timeNotificationController;
