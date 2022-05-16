/*
 *  Copyright 2019-2022 LiteFarm.org
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
const TaskModel = require('../models/taskModel');
const NotificationUser = require('../models/notificationUserModel');

const timeNotificationController = {
  /**
   * Notifies farm management of unassigned tasks due this week
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @async
   */
  async postWeeklyUnassignedTasks(req, res) {
    const { farm_id } = req.params;
    try {
      // All unassigned tasks at the farm associated with farm_id due this week that are
      // not completed or abandoned
      // We also want the translation key so that we have an icon we can use for the notification
      const { rows: unassignedTasks } = await TaskModel.knex().raw(
        `
        SELECT task.task_id, task_type.task_translation_key FROM task
        JOIN "userFarm" AS u ON task.owner_user_id = u.user_id
        JOIN task_type ON task_type.task_type_id = task.task_type_id
        WHERE u.farm_id = ? 
        AND task.assignee_user_id IS NULL
        AND task.complete_date IS NULL
        AND task.abandon_date IS NULL
        AND task.due_date <= (now() + interval '1 week')::date
        AND task.due_date >= now()::date
        AND task.deleted = false
        `,
        [farm_id],
      );

      const farmManagementObjs = await UserFarmModel.query()
        .select('user_id')
        .whereIn('role_id', [1, 2, 5])
        .where('userFarm.farm_id', farm_id);

      const farmManagement = farmManagementObjs.map(
        (farmManagementObj) => farmManagementObj.user_id,
      );

      if (unassignedTasks.length > 0) {
        await sendWeeklyUnassignedTaskNotifications(
          farm_id,
          farmManagement,
          unassignedTasks[0].task_translation_key,
        );
      }

      return res.status(201).send({ unassignedTasks, farmManagement });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error });
    }
  },

  /**
   * Notifies a user of tasks due today
   * @param {Request} req request
   * @param {Response} res response
   * @async
   */
  async postDailyDueTodayTasks(req, res) {
    const { farm_id } = req.params;
    try {
      const tasksDueToday = await TaskModel.query()
        .select('task.task_id', 'task_type.task_translation_key', 'task.assignee_user_id')
        .join('task_type', 'task_type.task_type_id', 'task.task_type_id')
        .whereNot({ 'task.assignee_user_id': null })
        .whereRaw('due_date = CURRENT_DATE')

      if (!tasksDueToday.length) {
        sendDailyDueTodayTaskNotification(
          farm_id,
          tasksDueToday,
        );
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error });
    }
  },
};

/**
 * Notifies farm management of unassigned tasks due this week
 * @param {String} farmId - id of the farm the farm managers belong to
 * @param {Array} farmManagement - user_ids of FM/FO/EO that need to be notified
 * @param {String} firstTaskTranslationKey - task translation key of the first unassigned task
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
 */
async function sendDailyDueTodayTaskNotification(
  farmId,
  userId,
) {
  await NotificationUser.notify(
    {
      title: {},
      body: {},
      variables: [],
      ref: {},
      context: {
        task_translation_key: {},
        notification_type: '',
      },
      farm_id: farmId,
    },
    [userId],
  );
}

module.exports = timeNotificationController;
