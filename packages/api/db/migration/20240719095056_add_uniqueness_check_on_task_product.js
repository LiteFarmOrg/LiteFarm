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
    const notDeletedDuplicates = duplicates.filter((dupe) => !dupe.deleted);
    let keep;
    let softDelete;
    if (notDeletedDuplicates.length === 0) {
      keep = duplicates.pop();
      await knex('soil_amendment_task_products').where('id', keep.id).update({ deleted: false });
      softDelete = duplicates;
    } else if (notDeletedDuplicates.length >= 1) {
      //Choose only or latest task_product with deleted false
      keep = notDeletedDuplicates.pop();
      softDelete = duplicates.filter((dupe) => dupe.id !== keep.id);
    }
    for (const deleteable of softDelete) {
      await knex('soil_amendment_task_products')
        .update({ deleted: true })
        .where('id', deleteable.id);
    }
  }

  // Add the partial unique index using raw SQL
  // Knex partial indexes not working correctly
  await knex.raw(`
    CREATE UNIQUE INDEX task_product_uniqueness_composite
    ON soil_amendment_task_products(task_id, product_id)
    WHERE deleted = false;
  `);
};

export const down = async function (knex) {
  /*----------------------------------------
   Add uniqueness check for (task_id, product_id) composite
  ----------------------------------------*/
  await knex.schema.alterTable('soil_amendment_task_products', (table) => {
    table.dropIndex(['task_id', 'product_id'], 'task_product_uniqueness_composite');
  });
};
