export const up = async function (knex) {
  const fieldCrops = await knex('fieldCrop');
  await knex.schema.renameTable('fieldCrop', 'management_plan');
  await knex.raw('ALTER TABLE management_plan ALTER COLUMN start_date TYPE date');
  await knex.raw('ALTER TABLE management_plan ALTER COLUMN end_date TYPE date');
  await knex.schema.alterTable('management_plan', (t) => {
    t.dropColumn('area_used');
    t.dropColumn('estimated_production');
    t.dropColumn('variety');
    t.dropColumn('estimated_revenue');
    t.dropColumn('is_by_bed');
    t.dropColumn('bed_config');
    t.boolean('needs_transplant').defaultTo(false);
    t.boolean('for_cover').defaultTo(false);
    t.renameColumn('start_date', 'seed_date');
    t.renameColumn('end_date', 'harvest_date');
    t.date('transplant_date');
    t.date('transplant_days');
    t.date('germination_date');
    t.date('germination_days');
    t.date('termination_date');
    t.date('termination_days');
    t.date('harvest_days');
    t.renameColumn('field_crop_id', 'management_plan_id');
  });
  await knex.schema.createTable('crop_management_plan', (t) => {
    t.integer('management_plan_id')
      .primary()
      .references('management_plan_id')
      .inTable('management_plan');
    t.enum('planting_type', ['BROADCAST', 'CONTAINER', 'BEDS', 'ROWS']);
    t.uuid('location_id').references('location_id').inTable('location');
    t.decimal('estimated_revenue', 36, 12);
    t.decimal('estimated_yield', 36, 12);
    t.enu('estimated_yield_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
    t.text('notes');
  });

  await knex.schema.createTable('broadcast', (t) => {
    t.integer('management_plan_id')
      .primary()
      .references('management_plan_id')
      .inTable('crop_management_plan');
    t.decimal('percentage_planted', 14, 12);
    t.decimal('area_used', 36, 12);
    t.enu('area_used_unit', ['m2', 'ha', 'ft2', 'ac']).defaultTo('m2');
    t.decimal('seeding_rate', 36, 12);
    t.decimal('required_seeds', 36, 12);
  });

  await knex.schema.createTable('container', (t) => {
    t.integer('management_plan_id')
      .primary()
      .references('management_plan_id')
      .inTable('crop_management_plan');
    t.boolean('in_ground');
    t.decimal('plant_spacing', 36, 12);
    t.enu('plant_spacing_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.integer('total_plants');
    t.integer('number_of_containers');
    t.integer('plants_per_container');
    t.decimal('planting_depth', 36, 12);
    t.enu('planting_depth_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.string('planting_soil');
    t.string('container_type');
  });

  await knex.schema.createTable('transplant_container', (t) => {
    t.integer('management_plan_id')
      .primary()
      .references('management_plan_id')
      .inTable('management_plan');
    t.uuid('location_id').references('location_id').inTable('location');
    t.boolean('in_ground');
    t.decimal('plant_spacing', 36, 12);
    t.enu('plant_spacing_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.integer('total_plants');
    t.integer('number_of_containers');
    t.integer('plants_per_container');
    t.decimal('planting_depth', 36, 12);
    t.enu('planting_depth_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.string('planting_soil');
    t.string('container_type');
  });

  await knex.schema.createTable('beds', (t) => {
    t.integer('management_plan_id')
      .primary()
      .references('management_plan_id')
      .inTable('management_plan');
    t.jsonb('bed_config');
    t.decimal('area_used', 36, 12);
    t.enu('area_used_unit', ['m2', 'ha', 'ft2', 'ac']).defaultTo('m2');
  });

  fieldCrops.map(async (fc) => {
    const [cropManagementPlan] = await knex('crop_management_plan')
      .insert({
        planting_type: fc.is_by_bed ? 'BEDS' : 'BROADCAST',
        management_plan_id: fc.field_crop_id,
        location_id: fc.location_id,
        estimated_revenue: fc.estimated_revenue,
        estimated_yield: fc.estimated_production,
      })
      .returning('*');
    if (fc.is_by_bed) {
      return await knex('beds').insert({
        management_plan_id: cropManagementPlan.management_plan_id,
        area_used: fc.area_used || null,
        bed_config: fc.bed_config,
      });
    } else {
      return await knex('broadcast').insert({
        area_used: fc.area_used || null,
        management_plan_id: cropManagementPlan.management_plan_id,
      });
    }
  });

  await knex.schema.alterTable('activityCrops', (t) => {
    t.renameColumn('field_crop_id', 'management_plan_id');
  });
  await knex.schema.alterTable('shiftTask', (t) => {
    t.renameColumn('field_crop_id', 'management_plan_id');
  });
};

export const down = async function (knex) {
  const broadcast = await knex('management_plan')
    .join(
      'crop_management_plan',
      'crop_management_plan.management_plan_id',
      'management_plan.management_plan_id',
    )
    .join('broadcast', 'broadcast.management_plan_id', 'management_plan.management_plan_id');

  const beds = await knex('management_plan')
    .join(
      'crop_management_plan',
      'crop_management_plan.management_plan_id',
      'management_plan.management_plan_id',
    )
    .join('beds', 'beds.management_plan_id', 'management_plan.management_plan_id');
  await knex.schema.dropTable('container');
  await knex.schema.dropTable('transplant_container');
  await knex.schema.dropTable('broadcast');
  await knex.schema.dropTable('beds');
  await knex.schema.dropTable('crop_management_plan');
  await knex.schema.renameTable('management_plan', 'fieldCrop');
  await knex.schema.alterTable('fieldCrop', (t) => {
    t.decimal('area_used', 36, 12);
    t.decimal('estimated_production', 36, 12);
    t.string('variety');
    t.decimal('estimated_revenue', 36, 12);
    t.boolean('is_by_bed');
    t.jsonb('bed_config');
    t.dropColumn('needs_transplant');
    t.dropColumn('for_cover');
    t.dropColumn('transplant_date');
    t.dropColumn('transplant_days');
    t.dropColumn('germination_date');
    t.dropColumn('germination_days');
    t.dropColumn('termination_date');
    t.dropColumn('termination_days');
    t.dropColumn('harvest_days');
    t.renameColumn('seed_date', 'start_date');
    t.renameColumn('harvest_date', 'end_date');
    t.renameColumn('management_plan_id', 'field_crop_id');
  });
  await knex.schema.alterTable('activityCrops', (t) => {
    t.renameColumn('management_plan_id', 'field_crop_id');
  });
  await knex.schema.alterTable('shiftTask', (t) => {
    t.renameColumn('management_plan_id', 'field_crop_id');
  });
  return await Promise.all(
    broadcast
      .map((fc) => {
        return knex('fieldCrop').where({ field_crop_id: fc.management_plan_id }).update({
          estimated_production: fc.estimated_yield,
          estimated_revenue: fc.estimated_revenue,
          area_used: fc.area_used,
          is_by_bed: false,
        });
      })
      .concat(
        beds.map((fc) => {
          return knex('fieldCrop').where({ field_crop_id: fc.management_plan_id }).update({
            estimated_production: fc.estimated_yield,
            estimated_revenue: fc.estimated_revenue,
            is_by_bed: true,
            bed_config: fc.bed_config,
            area_used: fc.area_used,
          });
        }),
      ),
  );
};
