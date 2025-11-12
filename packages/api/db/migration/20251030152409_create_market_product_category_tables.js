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
export const up = async function (knex) {
  await knex.schema.createTable('market_product_category', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  // Starting point is Data Food consortium top concepts found at:
  // https://github.com/datafoodconsortium/taxonomies/blob/main/productTypes.json
  const categories = [
    'BAKERY',
    'DAIRY_PRODUCT',
    'DRINK',
    'FROZEN',
    'FRUIT',
    'INEDIBLE',
    'LOCAL_GROCERY_STORE',
    'MEAT_PRODUCT',
    'VEGETABLE',
  ];

  const rows = categories.map((category) => ({ key: category }));
  await knex('market_product_category').insert(rows);

  await knex.schema.createTable('farm_market_product_category', (table) => {
    table
      .uuid('market_directory_info_id')
      .references('id')
      .inTable('market_directory_info')
      .notNullable();
    table
      .integer('market_product_category_id')
      .references('id')
      .inTable('market_product_category')
      .notNullable();
    table.unique(['market_directory_info_id', 'market_product_category_id']).primary();
  });

  await knex('permissions').insert([
    {
      permission_id: 183,
      name: 'get:market_product_categories',
      description: 'get market product categories',
    },
  ]);
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 183 },
    { role_id: 2, permission_id: 183 },
    { role_id: 3, permission_id: 183 },
    { role_id: 5, permission_id: 183 },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  const permissions = [183];
  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();

  await knex.schema.dropTable('farm_market_product_category');
  await knex.schema.dropTable('market_product_category');
};
