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

import { addTableEnumConstraintSql, dropTableEnumConstraintSql } from '../util.js';

export const up = async function (knex) {
  /*----------------------------------------
   Fix negative number values - only present on prod on soil_amendment task
  ----------------------------------------*/
  await knex.raw(`
    UPDATE soil_amendment_task_products
    SET volume = -volume
    WHERE volume IS NOT NULL
    AND volume < 0
  `);

  await knex.raw(`
    UPDATE soil_amendment_task_products
    SET weight = -weight
    WHERE weight IS NOT NULL
    AND weight < 0
  `);

  /*----------------------------------------
   Add checkPositive contraint  - to all new and touched number values
  ----------------------------------------*/

  await knex.schema.alterTable('soil_amendment_product', (table) => {
    table.decimal('n', 36, 12).nullable().checkPositive('check_positive_n').alter();
    // P in this case stands for Phosphate P2O5 also known as "Available Phosphorus"
    table.decimal('p', 36, 12).nullable().checkPositive('check_positive_p').alter();
    // K in this case stands for Potassium Oxide K2O also known as "Soluble Potash",
    table.decimal('k', 36, 12).nullable().checkPositive('check_positive_k').alter();
    table.decimal('calcium', 36, 12).nullable().checkPositive('check_positive_calcium').alter();
    table.decimal('magnesium', 36, 12).nullable().checkPositive('check_positive_magnesium').alter();
    table.decimal('sulfur', 36, 12).nullable().checkPositive('check_positive_sulfur').alter();
    table.decimal('copper', 36, 12).nullable().checkPositive('check_positive_copper').alter();
    table.decimal('manganese', 36, 12).nullable().checkPositive('check_positive_manganese').alter();
    table.decimal('boron', 36, 12).nullable().checkPositive('check_positive_boron').alter();
    table.decimal('ammonium', 36, 12).nullable().checkPositive('check_positive_ammonium').alter();
    table.decimal('nitrate', 36, 12).nullable().checkPositive('check_positive_nitrate').alter();
    table
      .decimal('moisture_content_percent', 36, 12)
      .nullable()
      .checkPositive('check_positive_moisture_content')
      .alter();
  });

  // Create new product table
  await knex.schema.alterTable('soil_amendment_task_products', (table) => {
    table.decimal('weight', 36, 12).nullable().checkPositive('check_positive_weight').alter();
    table.decimal('volume', 36, 12).nullable().checkPositive('check_positive_volume').alter();
    // TODO: LF-4246 backfill data for percent_of_location_amended then make notNullable and defaulted to 100
    table
      .decimal('percent_of_location_amended', 36, 12)
      .nullable()
      .checkPositive('check_positive_percent_of_location_amended')
      .alter();
    // TODO: LF-4246 backfill data for total_area_amended in m2 then make notNullable
    table
      .decimal('total_area_amended', 36, 12)
      .nullable()
      .checkPositive('check_positive_total_area_amended')
      .alter();
  });

  // Alter soil amendmendment task
  await knex.schema.alterTable('soil_amendment_task', (table) => {
    table
      .decimal('furrow_hole_depth', 36, 12)
      .nullable()
      .checkPositive('check_positive_furrow_hole_depth')
      .alter();
  });

  // Alter cleaning task for volume and weight
  await knex.schema.alterTable('cleaning_task', (table) => {
    table.decimal('weight', 36, 12).nullable().checkPositive('check_positive_weight').alter();
    table.decimal('volume', 36, 12).nullable().checkPositive('check_positive_volume').alter();
  });

  // Alter pest control task for volume and weight
  await knex.schema.alterTable('pest_control_task', (table) => {
    table.decimal('weight', 36, 12).nullable().checkPositive('check_positive_weight').alter();
    table.decimal('volume', 36, 12).nullable().checkPositive('check_positive_volume').alter();
  });

  /*----------------------------------------
   Rename tables to the singular instead of plural
  ----------------------------------------*/
  await knex.schema.renameTable('soil_amendment_task_products', 'soil_amendment_task_product');
  await knex.schema.renameTable(
    'soil_amendment_task_products_purpose_relationship',
    'soil_amendment_task_product_purpose_relationship',
  );
  await knex.schema.alterTable('soil_amendment_task_product_purpose_relationship', (table) => {
    table.renameColumn('task_products_id', 'task_product_id');
  });

  /*----------------------------------------
   Add type constraint to product
  ----------------------------------------*/
  await knex.raw(dropTableEnumConstraintSql('product', 'type'));
  await knex.schema.alterTable('product', (table) => {
    table.text('type').notNullable().alter();
  });
  await knex.raw(
    addTableEnumConstraintSql('product', 'type', [
      'soil_amendment_task',
      'pest_control_task',
      'cleaning_task',
    ]),
  );

  /*----------------------------------------
   Add uniqueness check for (task_id, product_id) composite - data deletion for local + beta only
  ----------------------------------------*/
  const taskProductsWithDuplicates = await knex
    .select('task_id', 'product_id')
    .count('*', { as: 'cnt' })
    .from('soil_amendment_task_product')
    .groupBy('task_id', 'product_id')
    .havingRaw('COUNT(*) > 1')
    .orderBy('task_id', 'asc');
  for (const taskProduct of taskProductsWithDuplicates) {
    const duplicates = await knex
      .select('*')
      .table('soil_amendment_task_product')
      .where({ task_id: taskProduct.task_id, product_id: taskProduct.product_id })
      .orderBy('created_at', 'asc');
    const countOfNotDeleted = duplicates.filter((dupe) => !dupe.deleted);
    let keep;
    let hardDelete;
    if (countOfNotDeleted.length === 0) {
      keep = duplicates.pop();
      await knex('soil_amendment_task_product').where('id', keep.id).update({ deleted: false });
      hardDelete = duplicates;
    } else if (countOfNotDeleted.length >= 1) {
      //Choose only or latest task_product with deleted false
      keep = countOfNotDeleted.pop();
      hardDelete = duplicates.filter((dupe) => dupe.id !== keep.id);
    }
    for (const deleteable of hardDelete) {
      await knex('soil_amendment_task_product_purpose_relationship')
        .where('task_products_id', deleteable.id)
        .del();
      await knex('soil_amendment_task_product').where('id', deleteable.id).del();
    }
  }

  await knex.schema.alterTable('soil_amendment_task_product', (table) => {
    table.unique(['task_id', 'product_id'], {
      indexName: 'task_product_uniqueness_composite',
    });
  });

  /*----------------------------------------
   Repair created_by and and updated_by on soil_amendment_task_product
  ----------------------------------------*/
  const allTaskProducts = await knex('soil_amendment_task_product').select('id', 'task_id');
  for (const tp of allTaskProducts) {
    const task = await knex('task')
      .select('created_by_user_id', 'updated_by_user_id')
      .where({ task_id: tp.task_id })
      .first();
    await knex('soil_amendment_task_product').where('id', tp.id).update({
      created_by_user_id: task.created_by_user_id,
      updated_by_user_id: task.updated_by_user_id,
    });
  }
};

export const down = async function (knex) {
  /*----------------------------------------
   Fix negative number values - only present on prod on soil_amendment task
  ----------------------------------------*/
  // Cannot be rolled back

  /*----------------------------------------
   Add checkPositive contraint  - to all new and touched number values
  ----------------------------------------*/

  await knex.schema.alterTable('soil_amendment_product', (table) => {
    table.dropChecks([
      'check_positive_n',
      'check_positive_p',
      'check_positive_k',
      'check_positive_calcium',
      'check_positive_magnesium',
      'check_positive_sulfur',
      'check_positive_copper',
      'check_positive_manganese',
      'check_positive_boron',
      'check_positive_ammonium',
      'check_positive_nitrate',
      'check_positive_moisture_content',
    ]);
  });

  // Create new product table
  await knex.schema.alterTable('soil_amendment_task_product', (table) => {
    table.dropChecks([
      'check_positive_weight',
      'check_positive_volume',
      'check_positive_percent_of_location_amended',
      'check_positive_total_area_amended',
    ]);
  });

  // Alter soil amendmendment task
  await knex.schema.alterTable('soil_amendment_task', (table) => {
    table.dropChecks(['check_positive_furrow_hole_depth']);
  });

  // Alter cleaning task for volume and weight
  await knex.schema.alterTable('cleaning_task', (table) => {
    table.dropChecks(['check_positive_weight', 'check_positive_volume']);
  });

  // Alter pest control task for volume and weight
  await knex.schema.alterTable('pest_control_task', (table) => {
    table.dropChecks(['check_positive_weight', 'check_positive_volume']);
  });

  /*----------------------------------------
   Rename tables to the singular instead of plural
  ----------------------------------------*/
  await knex.schema.renameTable('soil_amendment_task_product', 'soil_amendment_task_products');
  await knex.schema.renameTable(
    'soil_amendment_task_product_purpose_relationship',
    'soil_amendment_task_products_purpose_relationship',
  );
  await knex.schema.alterTable('soil_amendment_task_products_purpose_relationship', (table) => {
    table.renameColumn('task_product_id', 'task_products_id');
  });

  /*----------------------------------------
   Add type constraint to product
  ----------------------------------------*/
  await knex.raw(dropTableEnumConstraintSql('product', 'type'));
  await knex.schema.alterTable('product', (table) => {
    table.text('type').nullable().alter();
  });
  await knex.raw(
    addTableEnumConstraintSql('product', 'type', [
      'soil_amendment_task',
      'pest_control_task',
      'cleaning_task',
    ]),
  );

  /*----------------------------------------
   Add uniqueness check for (task_id, product_id) composite
  ----------------------------------------*/
  await knex.schema.alterTable('soil_amendment_task_products', (table) => {
    table.dropChecks(['task_product_uniqueness_composite']);
  });

  /*----------------------------------------
   Repair created_by and and updated_by on soil_amendment_task_product
  ----------------------------------------*/
  const allTaskProducts = await knex('soil_amendment_task_products').select('id', 'task_id');
  for (const tp of allTaskProducts) {
    const litefarmDBId = 1;
    await knex('soil_amendment_task_products')
      .where('id', tp.id)
      .update({ created_by_user_id: litefarmDBId, updated_by_user_id: litefarmDBId });
  }
};
