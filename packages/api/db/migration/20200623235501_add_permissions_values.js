/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20200623235501_add_permissions_values.js) is part of LiteFarm.
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

exports.up = function (knex, Promise) {
  return Promise.all([
    knex('permissions').insert([
      { name: 'add:actual_revenue', description: 'add actual revenue' },
      { name: 'add:crops', description: 'add crops' },
      { name: 'add:diseases', description: 'add diseases' },
      { name: 'add:expected_yields', description: 'add expected yields' },
      { name: 'add:expenses', description: 'add expenses' },
      { name: 'add:expense_types', description: 'add expense types' },
      { name: 'add:farms', description: 'add farms' },
      { name: 'add:farm_schedules', description: 'add farm schedules' },
      { name: 'add:fertilizers', description: 'add fertilizers' },
      { name: 'add:field_crops', description: 'add field crops' },
      { name: 'add:fields', description: 'add fields' },
      { name: 'add:insights', description: 'add insights' },
      { name: 'add:logs', description: 'add logs' },
      { name: 'add:pesticides', description: 'add pesticides' },
      { name: 'add:plans', description: 'add plans' },
      { name: 'add:prices', description: 'add prices' },
      { name: 'add:sales', description: 'add sales' },
      { name: 'add:shift_tasks', description: 'add shift tasks' },
      { name: 'add:shifts', description: 'add shifts' },
      { name: 'add:task_types', description: 'add task types' },
      { name: 'add:users', description: 'add users' },
      { name: 'add:yields', description: 'add yields' },
      { name: 'delete:crops', description: 'delete crops' },
      { name: 'delete:diseases', description: 'delete diseases' },
      { name: 'delete:expenses', description: 'delete expenses' },
      { name: 'delete:expense_types', description: 'delete expense types' },
      { name: 'delete:farms', description: 'delete farms' },
      { name: 'delete:farm_schedules', description: 'delete farm schedules' },
      { name: 'delete:fertilizers', description: 'delete fertilizers' },
      { name: 'delete:field_crops', description: 'delete field crops' },
      { name: 'delete:fields', description: 'delete fields' },
      { name: 'delete:insights', description: 'delete insights' },
      { name: 'delete:logs', description: 'delete logs' },
      { name: 'delete:plans', description: 'delete plans' },
      { name: 'delete:pesticides', description: 'delete pesticides' },
      { name: 'delete:prices', description: 'delete prices' },
      { name: 'delete:sales', description: 'delete sales' },
      { name: 'delete:shifts', description: 'delete shifts' },
      { name: 'delete:task_types', description: 'delete task types' },
      { name: 'delete:users', description: 'delete users' },
      { name: 'delete:yields', description: 'delete yields' },
      { name: 'edit:crops', description: 'edit crops' },
      { name: 'edit:diseases', description: 'edit diseases' },
      { name: 'edit:expenses', description: 'edit expenses' },
      { name: 'edit:expense_types', description: 'edit expense types' },
      { name: 'edit:farms', description: 'edit farms' },
      { name: 'edit:farm_schedules', description: 'edit farm schedules' },
      { name: 'edit:fertilizers', description: 'edit fertilizers' },
      { name: 'edit:field_crops', description: 'edit field crops' },
      { name: 'edit:fields', description: 'edit fields' },
      { name: 'edit:logs', description: 'edit logs' },
      { name: 'edit:pesticides', description: 'edit pesticides' },
      { name: 'edit:prices', description: 'edit prices' },
      { name: 'edit:sales', description: 'edit sales' },
      { name: 'edit:shifts', description: 'edit shifts' },
      { name: 'edit:task_types', description: 'edit task types' },
      { name: 'edit:users', description: 'edit users' },
      { name: 'edit:user_role', description: 'edit other users\' role' },
      { name: 'edit:user_status', description: 'edit other users\' status' },
      { name: 'edit:yields', description: 'edit yields' },
      { name: 'get:crops', description: 'get crops' },
      { name: 'get:diseases', description: 'get diseases' },
      { name: 'get:expenses', description: 'get expenses' },
      { name: 'get:expense_types', description: 'get expense types' },
      { name: 'get:farm_schedules', description: 'get farm schedules' },
      { name: 'get:fertilizers', description: 'get fertilizers' },
      { name: 'get:field_crops', description: 'get field crops' },
      { name: 'get:fields', description: 'get fields' },
      { name: 'get:fields_by_user', description: 'get fields by user' },
      { name: 'get:insights', description: 'get insights' },
      { name: 'get:logs', description: 'get logs' },
      { name: 'get:notifications', description: 'get notifications' },
      { name: 'get:pesticides', description: 'get pesticides' },
      { name: 'get:plans', description: 'get plans' },
      { name: 'get:prices', description: 'get prices' },
      { name: 'get:sales', description: 'get sales' },
      { name: 'get:shift_tasks', description: 'get shift tasks' },
      { name: 'get:shifts', description: 'get shifts' },
      { name: 'get:task_types', description: 'get task types' },
      { name: 'get:users', description: 'get users' },
      { name: 'get:user_farm_info', description: 'get user farm info' },
      { name: 'get:yields', description: 'get yields' },
    ]),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex('permissions').del(),
  ]);
};
