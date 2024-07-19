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
  /*----------------------------------------
   Add uniqueness check for (task_id, product_id) composite - data deletion for local + beta only
  ----------------------------------------*/
  const taskProductsWithDuplicates = await knex
    .select('task_id', 'product_id')
    .count('*', { as: 'cnt' })
    .from('soil_amendment_task_products')
    .groupBy('task_id', 'product_id')
    .havingRaw('COUNT(*) > 1')
    .orderBy('task_id', 'asc');
  for (const taskProduct of taskProductsWithDuplicates) {
    const duplicates = await knex
      .select('*')
      .table('soil_amendment_task_products')
      .where({ task_id: taskProduct.task_id, product_id: taskProduct.product_id })
      .orderBy('created_at', 'asc');
    const countOfNotDeleted = duplicates.filter((dupe) => !dupe.deleted);
    let keep;
    let hardDelete;
    if (countOfNotDeleted.length === 0) {
      keep = duplicates.pop();
      await knex('soil_amendment_task_products').where('id', keep.id).update({ deleted: false });
      hardDelete = duplicates;
    } else if (countOfNotDeleted.length >= 1) {
      //Choose only or latest task_product with deleted false
      keep = countOfNotDeleted.pop();
      hardDelete = duplicates.filter((dupe) => dupe.id !== keep.id);
    }
    for (const deleteable of hardDelete) {
      await knex('soil_amendment_task_products_purpose_relationship')
        .where('task_products_id', deleteable.id)
        .del();
      await knex('soil_amendment_task_products').where('id', deleteable.id).del();
    }
  }

  await knex.schema.alterTable('soil_amendment_task_products', (table) => {
    table.unique(['task_id', 'product_id'], {
      indexName: 'task_product_uniqueness_composite',
    });
  });
};

export const down = async function (knex) {
  /*----------------------------------------
   Add uniqueness check for (task_id, product_id) composite
  ----------------------------------------*/
  await knex.schema.alterTable('soil_amendment_task_products', (table) => {
    table.dropChecks(['task_product_uniqueness_composite']);
  });
};
