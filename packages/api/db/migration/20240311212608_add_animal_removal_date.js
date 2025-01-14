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
  for (const tableName of ['animal', 'animal_batch']) {
    await knex.schema.alterTable(tableName, (table) => {
      table.timestamp('removal_date').nullable();
    });

    // Amend existing data (beta + local only)
    await knex(tableName)
      .whereNotNull('animal_removal_reason_id')
      .update({ removal_date: new Date('2000/1/1').toISOString() });

    await knex.schema.alterTable(tableName, (table) => {
      table.check(
        '(animal_removal_reason_id IS NULL) OR (animal_removal_reason_id IS NOT NULL AND removal_date IS NOT NULL)',
        [],
        'removal_date_provided_check',
      );
      table.check(
        '(animal_removal_reason_id IS NOT NULL) OR (removal_date IS NULL AND removal_explanation IS NULL)',
        [],
        'removal_fields_null_if_not_removed_check',
      );
    });
  }
};

export const down = async function (knex) {
  for (const tableName of ['animal', 'animal_batch']) {
    await knex.schema.alterTable(tableName, (table) => {
      table.dropColumn('removal_date');
      table.dropChecks[('removal_date_provided_check', 'removal_fields_null_if_not_removed_check')];
    });
  }
};
