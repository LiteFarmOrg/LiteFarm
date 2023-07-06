/*
 *  Copyright 2023 LiteFarm.org
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

export const up = async function (knex) {
  // Get incorrect data
  const incorrectTaskData = await knex
    .with('joined_tables', (qb) => {
      qb.select(
        'location_tasks.task_id',
        'field_work_task.field_work_type_id',
        'location.farm_id as true_farm_id',
        'field_work_type.farm_id as false_farm_id',
        'field_work_type.field_work_name',
        'field_work_type.field_work_type_translation_key',
      )
        .from('location')
        .join('location_tasks', 'location.location_id', '=', 'location_tasks.location_id')
        .join('task', 'location_tasks.task_id', '=', 'task.task_id')
        .join('field_work_task', 'task.task_id', '=', 'field_work_task.task_id')
        .join(
          'field_work_type',
          'field_work_task.field_work_type_id',
          '=',
          'field_work_type.field_work_type_id',
        )
        .whereNotNull('field_work_type.farm_id');
    })
    .select('*')
    .from('joined_tables')
    .where('false_farm_id', '!=', knex.ref('true_farm_id'));
  console.log(`Mismatch found on ${incorrectTaskData.length} task(s)`);

  // newTaskTypes - { farm_id(s): { field_work_type_id(s)(previous): field_work_type_id(new) }}
  const newTaskTypes = {};
  let repairCount = 0;
  for (const task of incorrectTaskData) {
    // Handles case where multiple use of same incorrect field work task type
    if (
      newTaskTypes[task.true_farm_id] &&
      newTaskTypes[task.true_farm_id][task.field_work_type_id]
    ) {
      const updatedFieldWorkTaskId = await knex('field_work_task')
        .where('task_id', task.task_id)
        .update({ field_work_type_id: newTaskTypes[task.true_farm_id][task.field_work_type_id] }, [
          'task_id',
        ]); //update task
      if (updatedFieldWorkTaskId[0].task_id) {
        repairCount++;
      }
      continue;
    } else {
      // Make a new field work task type
      const newTypeId = await knex('field_work_type').insert(
        {
          farm_id: task.true_farm_id,
          field_work_name: task.field_work_name,
          field_work_type_translation_key: task.field_work_type_translation_key,
        },
        ['field_work_type_id'],
      );
      // Update field work task
      const updatedFieldWorkTaskId = await knex('field_work_task')
        .where('task_id', task.task_id)
        .update({ field_work_type_id: newTypeId[0].field_work_type_id }, ['task_id']);
      // Save new id for later use
      newTaskTypes[task.true_farm_id] = {
        ...newTaskTypes[task.true_farm_id],
        [task.field_work_type_id]: newTypeId[0].field_work_type_id,
      };
      if (updatedFieldWorkTaskId[0].task_id) {
        repairCount++;
      }
    }
  }
  console.log(`Repaired task count is ${repairCount} task(s)`);
};

export const down = async function () {
  console.log('INFO: Rolled back but sorry... migration of data cannot be undone!');
};
