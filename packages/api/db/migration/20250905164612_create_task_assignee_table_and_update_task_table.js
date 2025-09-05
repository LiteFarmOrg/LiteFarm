/*
 *  Copyright 2025 LiteFarm.org
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
export const up = async (knex) => {
  return knex.transaction(async (trx) => {
    await trx.schema.createTable('task_assignee', (table) => {
      table.integer('task_id').references('task_id').inTable('task').notNullable();
      table.string('assignee_user_id').references('user_id').inTable('users').notNullable();
      table.float('duration');
      table.integer('happiness');
      table.date('report_date');
      table.text('report_notes');
      table.float('wage_at_completion');
      table.string('revised_by_user_id').references('user_id').inTable('users');
      table.dateTime('revision_date');
      table.primary(['task_id', 'assignee_user_id']);
    });

    await trx.schema.alterTable('task', (table) => {
      table.float('task_hourly_wage');
    });

    // Insert tasks that have an assignee into task_assignee:
    // - task_id, assignee_user_id, duration, happiness remain the same
    // - complete_date → report_date, completion_notes → report_notes
    // - wage_at_moment → wage_at_completion only if override_hourly_wage is false
    await trx.raw(`
        INSERT INTO task_assignee (task_id, assignee_user_id, duration, happiness, report_date, report_notes, wage_at_completion)
        SELECT task_id,
            assignee_user_id,
            duration,
            happiness,
            complete_date AS report_date,
            completion_notes AS report_notes,
            CASE WHEN override_hourly_wage IS FALSE THEN wage_at_moment END AS wage_at_completion
        FROM task
        WHERE assignee_user_id IS NOT NULL
    `);

    // Set task_hourly_wage to wage_at_moment for tasks where override_hourly_wage is true
    await trx.raw(`
        UPDATE task
        SET task_hourly_wage = wage_at_moment
        WHERE override_hourly_wage IS TRUE
    `);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTable('task_assignee');
  await knex.schema.table('task', (table) => {
    table.dropColumn('task_hourly_wage');
  });
};
