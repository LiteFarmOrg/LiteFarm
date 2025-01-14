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

export const up = async function (knex) {
  await knex.schema.alterTable('animal_batch', (table) => {
    table.datetime('brought_in_date');
    table.datetime('birth_date');
    table.integer('origin_id').references('id').inTable('animal_origin');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('animal_batch', (table) => {
    table.dropColumn('brought_in_date');
    table.dropColumn('birth_date');
    table.dropColumn('origin_id');
  });
};
