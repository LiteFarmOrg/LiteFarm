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

const soilAmendmentFertiliserTypeKeys = ['DRY', 'LIQUID'];
const elementalUnits = ['percent', 'ratio', 'ppm', 'mg/kg'];
const molecularCompoundsUnits = ['ppm', 'mg/kg'];
const elements = ['n', 'p', 'k', 'calcium', 'magnesium', 'sulfur', 'copper', 'manganese', 'boron'];
const compounds = ['ammonium', 'nitrate'];
const amendmentProductPurposeKeys = [
  'STRUCTURE',
  'MOISTURE_RETENTION',
  'NUTRIENT_AVAILABILITY',
  'PH',
  'OTHER',
];
const amendmentMethodKeys = [
  'BROADCAST',
  'BANDED',
  'FURROW_HOLE',
  'SIDE_DRESS',
  'FERTIGATION',
  'FOLIAR',
  'OTHER',
];
const furrowHoleDepthUnits = ['cm', 'in'];
const metricWeightUnits = ['g', 'kg', 'mt'];
const imperialWeightUnits = ['oz', 'lb', 't'];
const weightUnits = [...metricWeightUnits, ...imperialWeightUnits];
const applicationRateWeightUnits = [
  'g/m2',
  'lb/ft2',
  'kg/m2',
  't/ft2',
  'mt/m2',
  'oz/ft2',
  'g/ha',
  'lb/ac',
  'kg/ha',
  't/ac',
  'mt/ha',
  'oz/ac',
];
const metricVolumeUnits = ['ml', 'l'];
const imperialVolumeUnits = ['fl-oz', 'gal'];
const volumeUnits = [...metricVolumeUnits, ...imperialVolumeUnits];
const applicationRateVolumeUnits = [
  'l/m2',
  'gal/ft2',
  'ml/m2',
  'fl-oz/ft2',
  'l/ha',
  'gal/ac',
  'ml/ha',
  'fl-oz/ac',
];

export const up = async function (knex) {
  // Create fertiliser types table
  await knex.schema.createTable('soil_amendment_fertiliser_type', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });
  // Add fertiliser types
  for (const key of soilAmendmentFertiliserTypeKeys) {
    await knex('soil_amendment_fertiliser_type').insert({
      key,
    });
  }

  await knex.schema.createTable('soil_amendment_product', (table) => {
    table.integer('product_id').references('product_id').inTable('product').primary();
    table
      .integer('soil_amendment_fertiliser_type_id')
      .references('id')
      .inTable('soil_amendment_fertiliser_type')
      .nullable();
    table.decimal('n', 36, 12);
    table.decimal('p', 36, 12);
    table.decimal('k', 36, 12);
    table.decimal('calcium', 36, 12);
    table.decimal('magnesium', 36, 12);
    table.decimal('sulfur', 36, 12);
    table.decimal('copper', 36, 12);
    table.decimal('manganese', 36, 12);
    table.decimal('boron', 36, 12);
    table.enu('elemental_unit', elementalUnits);
    table.decimal('ammonium', 36, 12);
    table.decimal('nitrate', 36, 12);
    table.enu('molecular_compounds_unit', molecularCompoundsUnits);
    // Dry matter content is currently 100 - moisture content
    table.decimal('moisture_content_percent', 36, 12);
    table.check(
      `(COALESCE(${elements.join(
        ', ',
      )}) IS NULL AND elemental_unit IS NULL) OR (COALESCE(${elements.join(
        ', ',
      )}) IS NOT NULL AND elemental_unit IS NOT NULL)`,
      [],
      'elemental_unit_check',
    );
    table.check(
      `elemental_unit != 'percent' OR (elemental_unit = 'percent' AND (${elements
        .map((element) => `COALESCE(${element}, 0)`)
        .join(' + ')}) <= 100)`,
      [],
      'elemental_percent_check',
    );
    table.check(
      `(COALESCE(${compounds.join(
        ', ',
      )}) IS NULL AND molecular_compounds_unit IS NULL) OR (COALESCE(${compounds.join(
        ', ',
      )}) IS NOT NULL AND molecular_compounds_unit IS NOT NULL)`,
      [],
      'molecular_compounds_unit_check',
    );
  });

  // TODO: Migrate fertilizer table into here?
  // Insert blank record into soil amendment product
  await knex.raw(`
    INSERT INTO soil_amendment_product (product_id)
    SELECT product_id FROM product
    WHERE product.type = 'soil_amendment_task'
  `);

  // Create amendment purpose table
  await knex.schema.createTable('soil_amendment_purpose', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  // Add purpose types
  for (const key of amendmentProductPurposeKeys) {
    await knex('soil_amendment_purpose').insert({
      key,
    });
  }

  // Create amendment task method table
  await knex.schema.createTable('soil_amendment_method', (table) => {
    table.increments('id').primary();
    table.string('key').notNullable();
  });

  // Add method types
  for (const key of amendmentMethodKeys) {
    await knex('soil_amendment_method').insert({
      key,
    });
  }

  // Create new product table
  await knex.schema.createTable('soil_amendment_task_products', (table) => {
    table.increments('id').primary();
    table.integer('task_id').references('task_id').inTable('task').notNullable();
    // TODO: LF-4246 backfill data if nulls exist on prod and constrain this to notNullable()
    table.integer('product_id').references('product_id').inTable('product');
    table.decimal('weight', 36, 12);
    table.enu('weight_unit', weightUnits);
    table.decimal('volume', 36, 12);
    table.enu('volume_unit', volumeUnits);
    table.enu('application_rate_weight_unit', applicationRateWeightUnits);
    table.enu('application_rate_volume_unit', applicationRateVolumeUnits);
    // TODO: LF-4246 backfill data for percent_of_location_amended then make notNullable and defaulted to 100
    table.decimal('percent_of_location_amended', 36, 12);
    // TODO: LF-4246 backfill data for total_area_amended in m2 then make notNullable
    table.decimal('total_area_amended', 36, 12);
    table.boolean('deleted').notNullable().defaultTo(false);
    table
      .string('created_by_user_id')
      .notNullable()
      .references('user_id')
      .inTable('users')
      .defaultTo(1);
    table
      .string('updated_by_user_id')
      .notNullable()
      .references('user_id')
      .inTable('users')
      .defaultTo(1);
    table.dateTime('created_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
    table.dateTime('updated_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
    // TODO: LF-4246 null product quantities exist on prod remove last OR constraint condition in the future
    table.check(
      '(?? IS NULL AND ?? IS NOT NULL) OR (?? IS NULL AND ?? IS NOT NULL) OR (?? IS NULL AND ?? IS NULL)',
      ['weight', 'volume', 'volume', 'weight', 'weight', 'volume'],
      'volume_or_weight_check',
    );
    table.check(
      '(?? IS NULL AND ?? IS NULL AND ?? IS NULL) OR (?? IS NOT NULL AND ?? IS NOT NULL AND ?? IS NOT NULL)',
      [
        'weight',
        'weight_unit',
        'application_rate_weight_unit',
        'weight',
        'weight_unit',
        'application_rate_weight_unit',
      ],
      'weight_unit_check',
    );
    table.check(
      '(?? IS NULL AND ?? IS NULL AND ?? IS NULL) OR (?? IS NOT NULL AND ?? IS NOT NULL AND ?? IS NOT NULL)',
      [
        'volume',
        'volume_unit',
        'application_rate_volume_unit',
        'volume',
        'volume_unit',
        'application_rate_volume_unit',
      ],
      'volume_unit_check',
    );
  });

  const soilAmendmentPurposes = await knex.select().table('soil_amendment_purpose');

  // Create amendment purpose table
  await knex.schema.createTable('soil_amendment_task_products_purpose_relationship', (table) => {
    table
      .integer('task_products_id')
      .references('id')
      .inTable('soil_amendment_task_products')
      .notNullable();
    table.integer('purpose_id').references('id').inTable('soil_amendment_purpose').notNullable();
    table.primary(['task_products_id', 'purpose_id']);
    table.string('other_purpose');
  });

  // Migrate existing weight data to the new table (reversibly)
  // This case should never happen - but if it does lets not delete data
  await knex.raw(`
    INSERT INTO soil_amendment_task_products (task_id, product_id, weight, weight_unit, application_rate_weight_unit)
    SELECT task_id, product_id, product_quantity, (CASE WHEN product_quantity IS NOT NULL THEN 'kg'::text ELSE NULL END) , (CASE WHEN product_quantity IS NOT NULL THEN 'kg/ha'::text ELSE NULL END) FROM soil_amendment_task
    WHERE product_quantity_unit IS NULL
  `);

  await knex.raw(`
    INSERT INTO soil_amendment_task_products (task_id, product_id, weight, weight_unit, application_rate_weight_unit)
    SELECT task_id, product_id, product_quantity, (CASE WHEN product_quantity IS NOT NULL THEN product_quantity_unit ELSE NULL END) , (CASE WHEN product_quantity IS NOT NULL THEN 'kg/ha'::text ELSE NULL END) FROM soil_amendment_task
    WHERE product_quantity_unit IN ('${metricWeightUnits.join("', '")}')
  `);

  await knex.raw(`
    INSERT INTO soil_amendment_task_products (task_id, product_id, weight, weight_unit, application_rate_weight_unit)
    SELECT task_id, product_id, product_quantity,(CASE WHEN product_quantity IS NOT NULL THEN product_quantity_unit ELSE NULL END), (CASE WHEN product_quantity IS NOT NULL THEN 'lb/ac'::text ELSE NULL END) FROM soil_amendment_task
    WHERE product_quantity_unit IN ('${imperialWeightUnits.join("', '")}')
  `);

  // Migrate existing volume data to the new table (reversibly)
  await knex.raw(`
    INSERT INTO soil_amendment_task_products (task_id, product_id, volume, volume_unit, application_rate_volume_unit)
    SELECT task_id, product_id, product_quantity,(CASE WHEN product_quantity IS NOT NULL THEN product_quantity_unit ELSE NULL END), (CASE WHEN product_quantity IS NOT NULL THEN 'l/ha'::text ELSE NULL END) FROM soil_amendment_task
    WHERE product_quantity_unit IN ('${metricVolumeUnits.join("', '")}')
  `);

  await knex.raw(`
    INSERT INTO soil_amendment_task_products (task_id, product_id, volume, volume_unit, application_rate_volume_unit)
    SELECT task_id, product_id, product_quantity, (CASE WHEN product_quantity IS NOT NULL THEN product_quantity_unit ELSE NULL END), (CASE WHEN product_quantity IS NOT NULL THEN 'gal/ac'::text ELSE NULL END) FROM soil_amendment_task
    WHERE product_quantity_unit IN ('${imperialVolumeUnits.join("', '")}')
  `);

  // Get Product Ids, and Purposes
  const soilAmendmentTaskPurposes = await knex
    .select('task_id', 'purpose', 'other_purpose')
    .table('soil_amendment_task');
  const soilAmendmentTaskProducts = await knex
    .select('id', 'task_id')
    .table('soil_amendment_task_products');
  const soilAmendmentTaskProductsPurposes = soilAmendmentTaskPurposes.map((task) => {
    const soilAmendmentTaskProduct = soilAmendmentTaskProducts.find(
      (pr) => pr.task_id === task.task_id,
    );
    const soilAmendmentPurpose = soilAmendmentPurposes.find(
      (pu) => pu.key === task.purpose?.toUpperCase(),
    );
    return {
      task_products_id: soilAmendmentTaskProduct?.id || null,
      purpose_id: soilAmendmentPurpose?.id || null,
      other_purpose: task.other_purpose || null,
    };
  });

  // Insert into relationship table
  for (const taskProductPurpose of soilAmendmentTaskProductsPurposes) {
    if (taskProductPurpose.purpose_id && taskProductPurpose.task_products_id) {
      await knex('soil_amendment_task_products_purpose_relationship').insert(taskProductPurpose);
    }
    // LF-4246 - no purpose_id or task_product_id
  }

  const soilAmendmentMethods = await knex.select().table('soil_amendment_method');
  const otherSoilAmendmentMethod = soilAmendmentMethods.find((method) => method.key === 'OTHER');

  // Alter soil amendmendment task
  await knex.schema.alterTable('soil_amendment_task', (table) => {
    table.dropColumn('product_id');
    table.dropColumn('product_quantity');
    table.dropColumn('product_quantity_unit');
    table.dropColumn('other_purpose');
    table.dropColumn('purpose');
    table.integer('method_id').references('id').inTable('soil_amendment_method');
    table.decimal('furrow_hole_depth', 36, 12);
    table.enu('furrow_hole_depth_unit', furrowHoleDepthUnits);
    table.string('other_application_method');
    table.check(
      `(other_application_method IS NOT NULL AND method_id = ${otherSoilAmendmentMethod.id}) OR (other_application_method IS NULL)`,
      [],
      'other_application_method_id_check',
    );
  });

  // Alter cleaning task for volume and weight
  await knex.schema.alterTable('cleaning_task', (table) => {
    table.decimal('weight', 36, 12);
    table.enu('weight_unit', weightUnits);
    table.decimal('volume', 36, 12);
    table.enu('volume_unit', volumeUnits);
  });

  // Alter pest control task for volume and weight
  await knex.schema.alterTable('pest_control_task', (table) => {
    table.decimal('weight', 36, 12);
    table.enu('weight_unit', weightUnits);
    table.decimal('volume', 36, 12);
    table.enu('volume_unit', volumeUnits);
  });

  // Migrate cleaning task existing volume and weight data (reversibly)
  await knex.raw(`
    UPDATE cleaning_task
    SET (volume, volume_unit) = (product_quantity, product_quantity_unit)
    WHERE product_quantity IS NOT NULL
    AND product_quantity_unit IN ('${volumeUnits.join("', '")}')
  `);
  await knex.raw(`
    UPDATE cleaning_task
    SET (weight, weight_unit) = (product_quantity, product_quantity_unit)
    WHERE product_quantity IS NOT NULL
    AND product_quantity_unit IN ('${weightUnits.join("', '")}')
  `);

  // Product is not required for cleaning task
  // https://github.com/knex/knex/issues/5966
  await knex.schema.alterTable('cleaning_task', (table) => {
    table.check(
      '(weight IS NULL AND volume IS NOT NULL) OR (volume IS NULL AND weight IS NOT NULL) OR (weight IS NULL AND volume IS NULL)',
      [],
      'volume_or_weight_check',
    );
    table.check(
      '(weight IS NULL AND weight_unit IS NULL) OR (weight IS NOT NULL AND weight_unit IS NOT NULL)',
      [],
      'weight_unit_check',
    );
    table.check(
      '(volume IS NULL AND volume_unit IS NULL) OR (volume IS NOT NULL AND volume_unit IS NOT NULL)',
      [],
      'volume_unit_check',
    );
  });

  // Migrate pest control task existing volume and weight data (reversibly)
  await knex.raw(`
    UPDATE pest_control_task
    SET (volume, volume_unit) = (product_quantity, product_quantity_unit)
    WHERE product_quantity IS NOT NULL
    AND product_quantity_unit IN ('${volumeUnits.join("', '")}')
  `);
  await knex.raw(`
    UPDATE pest_control_task
    SET (weight, weight_unit) = (product_quantity, product_quantity_unit)
    WHERE product_quantity IS NOT NULL
    AND product_quantity_unit IN ('${weightUnits.join("', '")}')
  `);

  // Product not required for pest control task
  await knex.schema.alterTable('pest_control_task', (table) => {
    table.check(
      '(weight IS NULL AND volume IS NOT NULL) OR (volume IS NULL AND weight IS NOT NULL) OR (weight IS NULL AND volume IS NULL)',
      [],
      'volume_or_weight_check',
    );
    table.check(
      '(weight IS NULL AND weight_unit IS NULL) OR (weight IS NOT NULL AND weight_unit IS NOT NULL)',
      [],
      'weight_unit_check',
    );
    table.check(
      '(volume IS NULL AND volume_unit IS NULL) OR (volume IS NOT NULL AND volume_unit IS NOT NULL)',
      [],
      'volume_unit_check',
    );
  });

  // Alter cleaning task for volume and weight
  await knex.schema.alterTable('cleaning_task', (table) => {
    table.dropColumn('product_quantity');
    table.dropColumn('product_quantity_unit');
  });

  // Alter cleaning task for volume and weight
  await knex.schema.alterTable('pest_control_task', (table) => {
    table.dropColumn('product_quantity');
    table.dropColumn('product_quantity_unit');
  });

  // Alter product to add product state type id
  // Removing npk to add new table instead no attempt to keep values as it is currently unused
  await knex.schema.alterTable('product', (table) => {
    table.dropChecks(['npk_unit_check', 'npk_percent_check']);
    table.dropColumn('n');
    table.dropColumn('p');
    table.dropColumn('k');
    table.dropColumn('npk_unit');
  });

  // Add permissions
  // Use task or product permissions as needed
};

export const down = async function (knex) {
  // No prod data unreleased feature - destroys data
  await knex.schema.alterTable('product', (table) => {
    table.decimal('n');
    table.decimal('p');
    table.decimal('k');
    table.enu('npk_unit', ['ratio', 'percent']);
    table.check(
      '(COALESCE(n, p, k) IS NULL AND npk_unit IS NULL) OR (COALESCE(n, p, k) IS NOT NULL AND npk_unit IS NOT NULL)',
      [],
      'npk_unit_check',
    );
    table.check(
      "npk_unit != 'percent' OR (npk_unit = 'percent' AND (n + p + k) <= 100)",
      [],
      'npk_percent_check',
    );
  });

  // Reverse product data migration
  await knex.schema.alterTable('soil_amendment_task', (table) => {
    table.dropChecks(['other_application_method_id_check']);
    table.decimal('product_quantity', 36, 12);
    table.enu('product_quantity_unit', [...weightUnits, ...volumeUnits]).defaultTo('kg');
    table.integer('product_id').references('product_id').inTable('product');
    table.string('other_purpose');
    table.enu(
      'purpose',
      amendmentProductPurposeKeys.map((k) => k.toLowerCase()),
    );
    table.dropColumn('method_id');
    table.dropColumn('other_application_method');
    table.dropColumn('furrow_hole_depth');
    table.dropColumn('furrow_hole_depth_unit');
  });

  await knex.schema.alterTable('cleaning_task', (table) => {
    table.decimal('product_quantity', 36, 12);
    table.enu('product_quantity_unit', volumeUnits).defaultTo('l');
  });

  await knex.schema.alterTable('pest_control_task', (table) => {
    table.decimal('product_quantity', 36, 12);
    table.text('product_quantity_unit', [...weightUnits, ...volumeUnits]).defaultTo('l');
  });

  // only saves the first product, destroys application rates
  const soilAmendmentTasks = await knex.select('*').table('soil_amendment_task');
  for (const task of soilAmendmentTasks) {
    const firstTaskProduct = await knex
      .select('*')
      .table('soil_amendment_task_products')
      .where('task_id', task.task_id)
      .orderBy('id', 'asc')
      .first();
    const firstTaskProductPurposeRelationship = await knex
      .select('*')
      .table('soil_amendment_task_products_purpose_relationship')
      .where('task_products_id', firstTaskProduct.id)
      .first();
    const firstTaskProductPurpose = firstTaskProductPurposeRelationship
      ? await knex
          .select('key')
          .table('soil_amendment_purpose')
          .where('id', firstTaskProductPurposeRelationship.purpose_id)
      : null;
    if (firstTaskProduct.weight) {
      await knex('soil_amendment_task')
        .where('task_id', task.task_id)
        .update({
          product_id: firstTaskProduct.product_id,
          product_quantity: firstTaskProduct.weight,
          product_quantity_unit: firstTaskProduct.weight_unit,
          other_purpose: firstTaskProductPurposeRelationship?.other_purpose || null,
          purpose: firstTaskProductPurpose
            ? String(firstTaskProductPurpose[0].key).toLowerCase()
            : null,
        });
    } else if (firstTaskProduct.volume) {
      await knex('soil_amendment_task')
        .where('task_id', task.task_id)
        .update({
          product_id: firstTaskProduct.product_id,
          product_quantity: firstTaskProduct.volume,
          product_quantity_unit: firstTaskProduct.volume_unit,
          other_purpose: firstTaskProductPurposeRelationship?.other_purpose || null,
          purpose: firstTaskProductPurpose
            ? String(firstTaskProductPurpose[0].key).toLowerCase()
            : null,
        });
    } else {
      await knex('soil_amendment_task')
        .where('task_id', task.task_id)
        .update({
          product_id: firstTaskProduct.product_id || null,
          other_purpose: firstTaskProductPurposeRelationship?.other_purpose || null,
          purpose: firstTaskProductPurpose
            ? String(firstTaskProductPurpose[0].key).toLowerCase()
            : null,
        });
    }
  }

  // Reverses cleaning task separation
  const cleaningTasks = await knex.select('*').table('cleaning_task');
  for (const task of cleaningTasks) {
    if (task.weight) {
      await knex('cleaning_task').where('task_id', task.task_id).update({
        product_quantity: task.weight,
        product_quantity_unit: task.weight_unit,
      });
    } else if (task.volume) {
      await knex('cleaning_task').where('task_id', task.task_id).update({
        product_quantity: task.volume,
        product_quantity_unit: task.volume_unit,
      });
    }
  }

  const pestControlTasks = await knex.select('*').table('pest_control_task');
  for (const task of pestControlTasks) {
    if (task.weight) {
      await knex('pest_control_task').where('task_id', task.task_id).update({
        product_quantity: task.weight,
        product_quantity_unit: task.weight_unit,
      });
    } else if (task.volume) {
      await knex('pest_control_task').where('task_id', task.task_id).update({
        product_quantity: task.volume,
        product_quantity_unit: task.volume_unit,
      });
    }
  }

  await knex.schema.alterTable('cleaning_task', (table) => {
    table.dropChecks(['volume_or_weight_check', 'weight_unit_check', 'volume_unit_check']);
    table.dropColumn('weight');
    table.dropColumn('weight_unit');
    table.dropColumn('volume');
    table.dropColumn('volume_unit');
  });

  await knex.schema.alterTable('pest_control_task', (table) => {
    table.dropChecks(['volume_or_weight_check', 'weight_unit_check', 'volume_unit_check']);
    table.dropColumn('weight');
    table.dropColumn('weight_unit');
    table.dropColumn('volume');
    table.dropColumn('volume_unit');
  });

  await knex.schema.dropTable('soil_amendment_task_products_purpose_relationship');
  await knex.schema.dropTable('soil_amendment_task_products');
  await knex.schema.dropTable('soil_amendment_purpose');
  await knex.schema.dropTable('soil_amendment_method');
  await knex.schema.dropTable('soil_amendment_product');
  await knex.schema.dropTable('soil_amendment_fertiliser_type');

  //Remove permissions
  // Use task or product permissions as needed
};
