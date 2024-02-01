/*
 *  Copyright (c) 2024 LiteFarm.org
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
  await knex.raw(`
    ALTER TABLE animal
    ADD CONSTRAINT "not_null_breed_id_check" 
    CHECK (
        default_breed_id IS NOT NULL
        OR custom_breed_id IS NOT NULL
    )`);

  // Make default type ID nullable for default breeds so we can have Unknown be a default for all types
  await knex.schema.alterTable('default_animal_breed', (table) => {
    table.integer('default_type_id').nullable().alter();
  });

  // Insert unknown breed with no type so that it applies to any type
  await knex('default_animal_breed').insert({
    key: 'UNKNOWN',
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('animal', (table) => {
    table.dropChecks(['not_null_breed_id_check']);
  });

  await knex('default_animal_breed').where({ default_type_id: null }).del();

  await knex.schema.alterTable('default_animal_breed', (table) => {
    table.integer('default_type_id').notNullable().alter();
  });
};
