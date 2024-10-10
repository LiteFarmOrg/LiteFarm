/*
 *  Copyright 2024 LiteFarm.org
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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // create an audit table
  await knex.schema.createTable('audit_log', (table) => {
    table.increments('id').primary();
    table.string('record_id').notNullable(); // expect string, number or UUID
    table.string('table_name').notNullable();
    table.string('column_name').notNullable();
    table.string('old_value').nullable();
    table.string('new_value').nullable();
    table.integer('user_id').defaultTo(1);
    table.timestamp('timestamp').defaultTo(knex.fn.now());
  });

  try {
    const incompleteTasksToBeUpdated = await knex.raw(`
      SELECT *
      FROM task t
      WHERE task_type_id = 8
        AND abandon_date is NULL
        AND complete_date is NULL
        AND override_hourly_wage is false
        AND wage_at_moment is NOT NULL
        AND t.created_at < '2023-11-21 10:23'
        AND t.deleted = FALSE
        AND t.assignee_user_id is NULL;
    `);

    await knex.transaction(async (trx) => {
      for (const task of incompleteTasksToBeUpdated.rows) {
        const { task_id, override_hourly_wage } = task;

        // Update incomplete task
        await knex('task')
          .where({ task_id })
          .update({ override_hourly_wage: true })
          .then(async () => {
            // Insert a row to the audit table
            await trx('audit_log').insert({
              record_id: task_id,
              table_name: 'task',
              column_name: 'override_hourly_wage', // the updated column
              old_value: override_hourly_wage,
              new_value: true,
            });
          });
      }
    });

    // Retrieve completed harvest tasks that do not have wage_at_moment
    const completedTasksToBeUpdated = await knex.raw(`
      SELECT t.task_id, t.wage_at_moment, "userFarm".wage
      FROM task t
      JOIN location_tasks ON t.task_id = location_tasks.task_id
      JOIN location ON location_tasks.location_id = location.location_id
      LEFT JOIN "userFarm" ON location.farm_id = "userFarm".farm_id
          AND ("userFarm".user_id = t.assignee_user_id OR (t.assignee_user_id IS NULL AND "userFarm".user_id IS NULL))
      JOIN users ON t.owner_user_id = users.user_id
      WHERE task_type_id = 8
        AND override_hourly_wage = FALSE
        AND complete_date is not NULL
        AND (t.created_at > '2021-10-31' AND t.created_at < '2023-11-21') 
        AND wage_at_moment is NULL
    `);

    await knex.transaction(async (trx) => {
      for (const task of completedTasksToBeUpdated.rows) {
        const { task_id, wage_at_moment, wage } = task;
        const newWage = wage.amount || 0;

        // Update incomplete task
        await trx('task')
          .where({ task_id })
          .update({ wage_at_moment: newWage })
          .then(async () => {
            // Insert a row to the audit table
            await trx('audit_log').insert({
              record_id: task_id,
              table_name: 'task',
              column_name: 'wage_at_moment', // the updated column
              old_value: wage_at_moment,
              new_value: newWage,
            });
          });
      }
    });
  } catch (error) {
    console.error('Error in rollback:', error);
    throw error; // Rethrow the error to ensure the migration fails
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  try {
    await knex.transaction(async (trx) => {
      const rows = await knex.select().from('audit_log');

      // Rollback modified tasks
      for (const row of rows) {
        const { record_id, column_name, old_value } = row;

        await trx('task')
          .where({ task_id: record_id })
          .update({ [column_name]: old_value });
      }
    });
  } catch (error) {
    console.error('Error in rollback:', error);
    throw error; // Rethrow the error to ensure the migration fails
  }

  await knex.schema.dropTable('audit_log');
};
