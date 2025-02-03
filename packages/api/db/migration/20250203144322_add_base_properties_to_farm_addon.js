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

export const up = async function (knex) {
  await knex.schema.alterTable('farm_addon', (t) => {
    t.boolean('deleted').notNullable().defaultTo(false);
    t.string('created_by_user_id').references('user_id').inTable('users');
    t.string('updated_by_user_id').references('user_id').inTable('users');
    t.dateTime('created_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
    t.dateTime('updated_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('farm_addon', (t) => {
    t.dropColumns([
      'deleted',
      'created_by_user_id',
      'updated_by_user_id',
      'created_at',
      'updated_at',
    ]);
  });
};
