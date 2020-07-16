/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (todoRoute.js) is part of LiteFarm.
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

const todoController = require('../controllers/todoController');
const express = require('express');
const router = express.Router();
const checkOwnership = require('../middleware/acl/checkOwnership');


router.post('/', todoController.addTodo());
router.get('/', todoController.getTodo());
router.put('/:id', checkOwnership('todo'), todoController.patchTodo());
router.delete('/:id', checkOwnership('todo'), todoController.deleteTodo());

module.exports = router;
