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

// No changes here to maintain compatibility with the original data
const productQuantityUnits = ['g', 'lb', 'kg', 't', 'mt', 'oz', 'l', 'gal', 'ml', 'fl-oz'];

export const up = async function (knex) {
  await knex.schema.createTable('soil_amendment_task_products', (table) => {
    table.increments('id').primary();
    table.integer('task_id').references('task_id').inTable('soil_amendment_task');
    table.integer('product_id').references('product_id').inTable('product');
    table.decimal('product_quantity', 36, 12);
    table.enu('product_quantity_unit', productQuantityUnits);
  });

  // Migrate existng data to the new table (reversibly)
  await knex.raw(`
    INSERT INTO soil_amendment_task_products (task_id, product_id, product_quantity, product_quantity_unit)
    SELECT task_id, product_id, product_quantity, product_quantity_unit FROM soil_amendment_task
  `);

  await knex.schema.alterTable('soil_amendment_task', (table) => {
    table.dropColumn('product_id');
    table.dropColumn('product_quantity');
    table.dropColumn('product_quantity_unit');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('soil_amendment_task', (table) => {
    table.decimal('product_quantity', 36, 12);
    table.enu('product_quantity_unit', productQuantityUnits);
    table.integer('product_id').references('product_id').inTable('product');
  });

  // Preserves one product per soil amendment task
  await knex.raw(`
    UPDATE soil_amendment_task
    SET product_quantity = satp.product_quantity, product_quantity_unit = satp.product_quantity_unit, product_id = satp.product_id
    FROM soil_amendment_task_products satp
    WHERE soil_amendment_task.task_id = satp.task_id
  `);

  await knex.schema.dropTable('soil_amendment_task_products');
};
