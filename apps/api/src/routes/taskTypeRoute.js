/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (taskTypeRoute.js) is part of LiteFarm.
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

import express from 'express';

const router = express.Router();
import TaskTypeController from '../controllers/taskTypeController.js';
import checkScope from '../middleware/acl/checkScope.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';

router.post(
  '/',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:task_types']),
  TaskTypeController.addType(),
);
router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:task_types']),
  TaskTypeController.getAllTypes(),
);
router.get(
  '/:task_type_id',
  hasFarmAccess({ params: 'task_type_id' }),
  checkScope(['get:task_types']),
  TaskTypeController.getTypeByID(),
);
router.delete(
  '/:task_type_id',
  hasFarmAccess({ params: 'task_type_id' }),
  checkScope(['delete:task_types']),
  TaskTypeController.delType(),
);

export default router;
