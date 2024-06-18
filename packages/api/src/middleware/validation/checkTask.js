/*
 *  Copyright (c) 2024 LiteFarm.org
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

import TaskModel from '../../models/taskModel.js';
const adminRoles = [1, 2, 5];

export function checkAbandonTask() {
  return async (req, res, next) => {
    try {
      const { task_id } = req.params;
      const { user_id } = req.headers;
      const {
        abandonment_reason,
        other_abandonment_reason,
        happiness,
        duration,
        abandon_date,
      } = req.body;

      // Notifications will not send without, and checks below will be faulty
      if (!user_id) {
        return res.status(400).send('must have user_id');
      }

      if (!abandonment_reason) {
        return res.status(400).send('must have abandonment_reason');
      }

      if (abandonment_reason.toUpperCase() === 'OTHER' && !other_abandonment_reason) {
        return res.status(400).send('must have other_abandonment_reason');
      }

      if (!abandon_date) {
        return res.status(400).send('must have abandonment_date');
      }

      const checkTaskStatus = await TaskModel.getTaskStatus(task_id);
      if (checkTaskStatus.complete_date || checkTaskStatus.abandon_date) {
        return res.status(400).send('Task has already been completed or abandoned');
      }

      const { owner_user_id, assignee_user_id } = await TaskModel.query()
        .select('owner_user_id', 'assignee_user_id', 'wage_at_moment', 'override_hourly_wage')
        .where({ task_id })
        .first();
      const isUserTaskOwner = user_id === owner_user_id;
      const isUserTaskAssignee = user_id === assignee_user_id;
      const hasAssignee = assignee_user_id !== null;

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
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error,
      });
    }
  };
}

export function checkCompleteTask() {
  return async (req, res, next) => {
    try {
      const { task_id } = req.params;
      //const { user_id } = req.auth;
      const { assignee_user_id } = await TaskModel.query()
        .select('owner_user_id', 'assignee_user_id', 'wage_at_moment', 'override_hourly_wage')
        .where({ task_id })
        .first();
      // cannot abandon an unassigned task with rating or duration
      const hasAssignee = assignee_user_id !== null;
      if (!hasAssignee) {
        return res.status(400).send('An unassigned task cannot be completed');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error,
      });
    }
  };
}
