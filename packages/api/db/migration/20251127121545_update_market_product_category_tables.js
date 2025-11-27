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
  const deleteCategories = ['DRINK', 'INEDIBLE', 'LOCAL_GROCERY_STORE'];
  const deleteCategoriesIds = (
    await knex('market_product_category').whereIn('key', deleteCategories).select('id')
  ).map(({ id }) => id);
  await knex('market_directory_info_market_product_category')
    .whereIn('market_product_category_id', deleteCategoriesIds)
    .del();
  await knex('market_product_category').whereIn('key', deleteCategories).del();

  // Starting point is Data Food consortium top concepts found at:
  // https://github.com/datafoodconsortium/taxonomies/blob/main/productTypes.json
  const newCategories = ['ALCOHOLIC_BEVERAGE', 'EGG', 'FLOWER', 'PLANT'];

  const rows = newCategories.map((category) => ({ key: category }));
  await knex('market_product_category').insert(rows);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  const deleteCategories = ['ALCOHOLIC_BEVERAGE', 'EGG', 'FLOWER', 'PLANT'];
  const deleteCategoriesIds = (
    await knex('market_product_category').whereIn('key', deleteCategories).select('id')
  ).map(({ id }) => id);
  await knex('market_directory_info_market_product_category')
    .whereIn('market_product_category_id', deleteCategoriesIds)
    .del();
  await knex('market_product_category').whereIn('key', deleteCategories).del();

  // Starting point is Data Food consortium top concepts found at:
  // https://github.com/datafoodconsortium/taxonomies/blob/main/productTypes.json
  const newCategories = ['DRINK', 'INEDIBLE', 'LOCAL_GROCERY_STORE'];

  const rows = newCategories.map((category) => ({ key: category }));
  await knex('market_product_category').insert(rows);
};
