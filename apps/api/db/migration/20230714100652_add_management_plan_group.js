/*
 *  Copyright (c) 2023 LiteFarm.org
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
  await knex.schema.createTable('management_plan_group', (t) => {
    t.uuid('management_plan_group_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('created_by_user_id').references('user_id').inTable('users');
    t.string('updated_by_user_id').references('user_id').inTable('users');
    t.dateTime('created_at').notNullable();
    t.dateTime('updated_at').notNullable();
    t.smallint('repetition_count').notNullable();
    t.jsonb('repetition_config').notNullable();
    t.boolean('deleted').notNullable().defaultTo(false);
  });
  await knex.schema.alterTable('management_plan', (t) => {
    t.uuid('management_plan_group_id')
      .references('management_plan_group_id')
      .inTable('management_plan_group')
      .nullable();
    t.smallint('repetition_number').nullable();
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('management_plan', (t) => {
    t.dropColumn('management_plan_group_id');
    t.dropColumn('repetition_number');
  });
  await knex.schema.dropTable('management_plan_group');
};
