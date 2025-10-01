/*
 *  Copyright (c) 2025 LiteFarm.org
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

import { NextFunction, Response, Request } from 'express';
import TaskModel from '../../models/taskModel.js';
import { Task } from '../../models/types.js';

export function checkProductUsageInTasks() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_id } = req.params;
      const { farm_id } = req.headers;

      const tasksUsingProduct: Task[] = await TaskModel
        // @ts-expect-error known issue on models
        .query()
        .where({ 'task.deleted': false })
        .modify('onFarmByLocationTasks', farm_id)
        .modify('usingProduct', product_id);

      const plannedTasksUsingProduct = tasksUsingProduct.filter(
        (task) => task.complete_date === null && task.abandon_date === null,
      );

      if (plannedTasksUsingProduct.length) {
        return res.status(400).send('Cannot remove; planned tasks are using this product');
      }

      res.locals.isUnusedByTasks = !tasksUsingProduct.length;

      next();
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  };
}
