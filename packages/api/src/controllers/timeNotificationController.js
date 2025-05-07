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

import UserFarmModel from '../models/userFarmModel.js';

import TaskModel from '../models/taskModel.js';
import NotificationModel from '../models/notificationModel.js';
import NotificationUser from '../models/notificationUserModel.js';
import { getTasksForFarm } from './taskController.js';
import { mockGetFarmIrrigationPrescriptions } from '../util/ensembleService.js';

const timeNotificationController = {
  /**
   * Notifies farm management of unassigned tasks due this week.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @async
   */
  async postWeeklyUnassignedTasks(req, res) {
    const { farm_id } = req.params;
    const { isDayLaterThanUtc } = req.body;

    try {
      // All unassigned tasks at the farm associated with farm_id due this week that are
      // not completed or abandoned
      const tasksFromFarm = await getTasksForFarm(farm_id);
      const taskIds = tasksFromFarm.map(({ task_id }) => task_id);

      const unassignedTasks = await TaskModel.getUnassignedTasksDueThisWeekFromIds(
        taskIds,
        isDayLaterThanUtc,
      );
      const farmManagementObjs = await UserFarmModel.getFarmManagementByFarmId(farm_id);

      const farmManagement = farmManagementObjs.map(
        (farmManagementObj) => farmManagementObj.user_id,
      );

      if (unassignedTasks.length > 0 && farmManagement.length > 0) {
        await sendWeeklyUnassignedTaskNotifications(farm_id, farmManagement, isDayLaterThanUtc);
      }

      const status = unassignedTasks.length > 0 && farmManagement.length > 0 ? 201 : 200;
      return res
        .status(status)
        .send(`${status === 201 ? farmManagement.length : 0} notifications sent.`);
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
    const { isDayLaterThanUtc } = req.body;
    try {
      let notificationsSent = 0;
      const activeUsers = await UserFarmModel.getActiveUsersFromFarmId(farm_id);
      const tasksFromFarm = await getTasksForFarm(farm_id);
      const taskIdsFromFarm = tasksFromFarm.map(({ task_id }) => task_id);

      for (const { user_id } of activeUsers) {
        const hasTasksDueToday = await TaskModel.hasTasksDueTodayForUserFromFarm(
          user_id,
          taskIdsFromFarm,
          isDayLaterThanUtc,
        );

        if (hasTasksDueToday) {
          await sendDailyDueTodayTaskNotification(farm_id, user_id, isDayLaterThanUtc);
          notificationsSent++;
        }
      }
      return res
        .status(notificationsSent ? 201 : 200)
        .send(`${notificationsSent} notifications sent.`);
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error });
    }
  },

  /**
   * Notifies all users of new irrigation prescriptions
   * @param {Request} req request
   * @param {Response} res response
   * @async
   */
  async postDailyNewIrrigationPrescriptions(req, res) {
    const { farm_id } = req.params;
    const { isDayLaterThanUtc } = req.body;
    try {
      // TODO: Use real function after LF-4765 is merged
      const farmIrrigationPrescriptions = await mockGetFarmIrrigationPrescriptions(farm_id);

      let notificationsSent = 0;

      for (const prescription of farmIrrigationPrescriptions) {
        const { id: irrigation_prescription_id } = prescription;

        const previousNotification = await NotificationModel.query()
          .skipUndefined()
          .where('farm_id', farm_id)
          .whereJsonSupersetOf('context', {
            irrigation_prescription_id,
          })
          .first();

        if (previousNotification) {
          continue;
        }

        const activeUsers = await UserFarmModel.getActiveUsersFromFarmId(farm_id);

        const userIds = activeUsers.map(({ user_id }) => user_id);

        await sendDailyNewIrrigationPrescriptionNotification(
          farm_id,
          userIds,
          isDayLaterThanUtc,
          irrigation_prescription_id,
        );
        notificationsSent += userIds.length;
      }

      return res
        .status(notificationsSent ? 201 : 200)
        .send(`${notificationsSent} irrigation prescription notifications sent.`);
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
 * @param {Boolean} isDayLaterThanUtc  - offset “today” by +1 day for UTC+ zones
 * @async
 */
async function sendWeeklyUnassignedTaskNotifications(farmId, farmManagement, isDayLaterThanUtc) {
  const today = new Date();
  if (isDayLaterThanUtc) today.setDate(today.getDate() + 1);
  const todayStr = today.toISOString().split('T')[0];
  await NotificationUser.notify(
    {
      title: { translation_key: 'NOTIFICATION.WEEKLY_UNASSIGNED_TASKS.TITLE' },
      body: { translation_key: 'NOTIFICATION.WEEKLY_UNASSIGNED_TASKS.BODY' },
      variables: [],
      ref: { url: '/tasks' },
      context: {
        task_translation_key: 'FIELD_WORK_TASK',
        notification_type: 'WEEKLY_UNASSIGNED_TASKS',
        notification_date: todayStr,
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
 * @param {Boolean} isDayLaterThanUtc  - offset “today” by +1 day for UTC+ zones
 * @async
 */
async function sendDailyDueTodayTaskNotification(farmId, userId, isDayLaterThanUtc) {
  const today = new Date();
  if (isDayLaterThanUtc) today.setDate(today.getDate() + 1);
  const todayStr = today.toISOString().split('T')[0];
  await NotificationUser.notify(
    {
      title: { translation_key: 'NOTIFICATION.DAILY_TASKS_DUE_TODAY.TITLE' },
      body: { translation_key: 'NOTIFICATION.DAILY_TASKS_DUE_TODAY.BODY' },
      variables: [],
      ref: { url: '/tasks' },
      context: {
        task_translation_key: 'FIELD_WORK_TASK',
        notification_type: 'DAILY_TASKS_DUE_TODAY',
        notification_date: todayStr,
      },
      farm_id: farmId,
    },
    [userId],
  );
}

/**
 * Sends notification to a user of a new irrigation prescription
 * @param {String} farmId
 * @param {String[]} userIds
 * @param {Boolean} isDayLaterThanUtc  - offset “today” by +1 day for UTC+ zones
 * @async
 */
async function sendDailyNewIrrigationPrescriptionNotification(
  farmId,
  userIds,
  isDayLaterThanUtc,
  irrigation_prescription_id,
) {
  const today = new Date();
  if (isDayLaterThanUtc) today.setDate(today.getDate() + 1);
  const todayStr = today.toISOString().split('T')[0];
  await NotificationUser.notify(
    {
      title: { translation_key: 'NOTIFICATION.NEW_IRRIGATION_PRESCRIPTION.TITLE' },
      body: { translation_key: 'NOTIFICATION.NEW_IRRIGATION_PRESCRIPTION.BODY' },
      variables: [],
      ref: { url: `/irrigation_prescription/${irrigation_prescription_id}` },
      context: {
        icon_translation_key: 'IRRIGATION_PRESCRIPTION',
        notification_type: 'NEW_IRRIGATION_PRESCRIPTION',
        notification_date: todayStr,
        irrigation_prescription_id,
      },
      farm_id: farmId,
    },
    userIds,
  );
}

export default timeNotificationController;
