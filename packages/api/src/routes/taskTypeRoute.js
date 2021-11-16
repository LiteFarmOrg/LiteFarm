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

const express = require('express');
const router = express.Router();
const TaskTypeController = require('../controllers/taskTypeController');
const checkScope = require('../middleware/acl/checkScope');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');

router.post('/', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:task_types']), TaskTypeController.addType());
router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:task_types']), TaskTypeController.getAllTypes());
router.get('/:task_type_id', hasFarmAccess({ params: 'task_type_id' }), checkScope(['get:task_types']), TaskTypeController.getTypeByID());
router.delete('/:task_type_id', hasFarmAccess({ params: 'task_type_id' }), checkScope(['delete:task_types']), TaskTypeController.delType());

module.exports = router;
