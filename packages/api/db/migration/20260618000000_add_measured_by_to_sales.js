/*
 *  Copyright 2026 LiteFarm.org
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

const SALE_TABLES = ['crop_variety_sale', 'animal_sale'];

export const up = async function (knex) {
  for (const tableName of SALE_TABLES) {
    // Widen quantity_unit to allow volume units and the count marker.
    await knex.schema.raw(`
      ALTER TABLE "${tableName}"
      DROP CONSTRAINT "${tableName}_quantity_unit_check",
      ADD CONSTRAINT "${tableName}_quantity_unit_check"
      CHECK (quantity_unit IN ('kg', 'mt', 'lb', 't', 'ml', 'l', 'gal', 'fl-oz', 'unit'))
    `);
  }
};

export const down = async function (knex) {
  for (const tableName of SALE_TABLES) {
    // The narrowed constraint only permits weight units, so coerce any volume/unit rows
    // back to the weight default before restoring it.
    await knex(tableName)
      .whereNotIn('quantity_unit', ['kg', 'mt', 'lb', 't'])
      .update({ quantity_unit: 'kg' });

    await knex.schema.raw(`
      ALTER TABLE "${tableName}"
      DROP CONSTRAINT "${tableName}_quantity_unit_check",
      ADD CONSTRAINT "${tableName}_quantity_unit_check"
      CHECK (quantity_unit IN ('kg', 'mt', 'lb', 't'))
    `);
  }
};
