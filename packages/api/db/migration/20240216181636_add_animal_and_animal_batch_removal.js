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
  await knex.schema.createTable('animal_removal_reason', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  const removalReasonKeys = [
    'SOLD',
    'SLAUGHTERED_FOR_SALE',
    'SLAUGHTERED_FOR_CONSUMPTION',
    'NATURAL_DEATH',
    'CULLED',
    'OTHER',
  ];

  for (const key of removalReasonKeys) {
    await knex('animal_removal_reason').insert({
      key,
    });
  }

  for (const tableName of ['animal', 'animal_batch']) {
    await knex.schema.alterTable(tableName, (table) => {
      table.boolean('removed').notNullable().defaultTo(false);
      table.integer('animal_removal_reason_id').references('id').inTable('animal_removal_reason');
      table.string('removal_explanation');

      // Within knex.alterTable(), table.check() only works with an empty binding array (see https://github.com/knex/documentation/issues/492), despite the knex docs https://knexjs.org/guide/schema-builder.html#check
      table.check(
        'removed = false OR (removed = true AND animal_removal_reason_id is not null)',
        [],
        'removal_reason_provided_check',
      );
    });
  }
};

export const down = async function (knex) {
  for (const tableName of ['animal', 'animal_batch']) {
    await knex.schema.alterTable(tableName, (table) => {
      table.dropColumn('removal_explanation');
      table.dropColumn('animal_removal_reason_id');
      table.dropColumn('removed');
      table.dropChecks['removal_reason_provided_check'];
    });
  }

  await knex.schema.dropTable('animal_removal_reason');
};
