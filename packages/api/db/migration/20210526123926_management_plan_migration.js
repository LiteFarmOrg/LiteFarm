exports.up = async function(knex) {
  const fieldCrops = await knex('fieldCrop');
  await knex.schema.renameTable('fieldCrop', 'management_plan');
  await knex.raw('ALTER TABLE management_plan ALTER COLUMN start_date TYPE date')
  await knex.raw('ALTER TABLE management_plan ALTER COLUMN end_date TYPE date')
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
    t.uuid('crop_management_plan_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    t.enum('planting_type', ['BROADCAST', 'CONTAINER', 'BEDS', 'ROWS']);
    t.integer('management_plan_id').references('management_plan_id').inTable('management_plan');
    t.uuid('location_id').references('location_id').inTable('location');
    t.text('notes');
  });

  await knex.schema.createTable('broadcast', (t) => {
    t.uuid('crop_management_plan_id').primary()
      .references('crop_management_plan_id').inTable('crop_management_plan');
    t.decimal('percentage_planted', 14, 12);
    t.decimal('area_used', 36, 12);
    t.decimal('seeding_rate', 36, 12);
    t.decimal('required_seeds', 36, 12);
    t.decimal('estimated_yield', 36, 12);
  });

  await knex.schema.createTable('container', (t) => {
    t.uuid('crop_management_plan_id').primary()
      .references('crop_management_plan_id').inTable('crop_management_plan');
    t.boolean('in_ground');
    t.decimal('plant_spacing', 36, 12);
    t.integer('total_plants');
    t.integer('number_of_containers');
    t.integer('plants_per_container');
    t.decimal('planting_depth', 36, 12);
    t.string('planting_soil');
    t.string('container_type');
  });

  fieldCrops.map(async (fc) => {
    const [cropManagementPlan] = await knex('crop_management_plan').insert({
      planting_type: 'BROADCAST',
      management_plan_id: fc.field_crop_id,
      location_id: fc.location_id,
    }).returning('*');
    return await knex('broadcast').insert({
      area_used: fc.area_used,
      crop_management_plan_id: cropManagementPlan.crop_management_plan_id
    });
  })
};

exports.down = async function(knex) {
  await knex.dropTable('container');
  await knex.dropTable('broadcast');
  await knex.dropTable('crop_management_plan');
  await knex.schema.renameTable('management_plan', 'fieldCrop');
  await knex.schema.alterTable('fieldCrop', (t) => {
    t.decimal('area_used');
    t.decimal('estimated_production');
    t.string('variety');
    t.decimal('estimated_revenue');
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
    t.renameColumn('seed_date', 'start_date')
    t.renameColumn('harvest_date', 'end_date')
    t.renameColumn('management_plan_id', 'field_crop_id');
  });
};
