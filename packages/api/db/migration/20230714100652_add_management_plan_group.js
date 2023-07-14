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
  await knex.schema.alterTable('management_plan', (t) => {
    t.integer('group_id').nullable().defaultTo(null);
    t.smallint('repetition_number').nullable().defaultTo(null);
    t.smallint('repetition_count').nullable().defaultTo(null);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('management_plan', (t) => {
    t.dropColumn('group_id');
    t.dropColumn('repetition_number');
    t.dropColumn('repetition_count');
  });
};
