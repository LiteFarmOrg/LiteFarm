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
    await trx.schema.createTable('product_farm', (table) => {
      table.integer('product_id').references('product_id').inTable('product').notNullable();
      table.uuid('farm_id').references('farm_id').inTable('farm').notNullable();
      table.boolean('archived').notNullable().defaultTo(false);
      table.string('supplier');
      table.enum('on_permitted_substances_list', ['YES', 'NO', 'NOT_SURE']);
      table.primary(['product_id', 'farm_id']);
    });

    // Move existing data from product to product_farm
    const productDataToMigrate = await trx('product')
      .select('product_id', 'farm_id', 'supplier', 'on_permitted_substances_list')
      .whereNotNull('farm_id')
      .select(trx.raw('false as archived'));

    /* Note: This will not move the legacy library data that has null farm_id, but nor will any data be lost when migrationing + rolling back, as those products all have null supplier and on_permitted_substances_list fields anyway */

    if (productDataToMigrate.length) {
      await trx('product_farm').insert(productDataToMigrate);
    }

    await trx.schema.alterTable('product', (table) => {
      table.dropColumns(['farm_id', 'supplier', 'on_permitted_substances_list']);
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.table('product', (table) => {
    table.uuid('farm_id').references('farm_id').inTable('farm');
    table.string('supplier');
    table.enum('on_permitted_substances_list', ['YES', 'NO', 'NOT_SURE']);
  });

  // Restore data from product_farm to product
  const productFarmRows = await knex('product_farm').select('*');

  for (const row of productFarmRows) {
    await knex('product').where('product_id', row.product_id).update({
      farm_id: row.farm_id,
      supplier: row.supplier,
      on_permitted_substances_list: row.on_permitted_substances_list,
    });
  }

  await knex.schema.dropTable('product_farm');
};
