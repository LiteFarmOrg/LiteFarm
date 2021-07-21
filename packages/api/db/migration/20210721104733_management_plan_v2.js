exports.up = async function(knex) {
  await knex.schema.createTable('final_planting_method', t => {
    t.integer('management_plan_id').primary().references('management_plan_id').inTable('management_plan');
    t.enu('planting_method', ['BROADCAST_METHOD', 'CONTAINER_METHOD', 'BED_METHOD', 'ROW_METHOD']);
    t.boolean('is_planting_method_known');
    t.decimal('estimated_seeds', 36, 12);
    t.enu('estimated_seeds_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
    t.decimal('estimated_yield', 36, 12);
    t.enu('estimated_yield_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
    t.decimal('estimated_revenue', 36, 12);
    t.uuid('location_id').references('location_id').inTable('location');
    t.jsonb('pin_coordinate').notNullable();
    t.text('notes');
  });
  await knex.schema.createTable('initial_planting_method', t => {
    t.integer('management_plan_id').primary().references('management_plan_id').inTable('management_plan');
    t.enu('planting_method', ['BROADCAST_METHOD', 'CONTAINER_METHOD', 'BED_METHOD', 'ROW_METHOD']);
    t.boolean('is_planting_method_known');
    t.decimal('estimated_seeds', 36, 12);
    t.enu('estimated_seeds_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
    t.decimal('estimated_yield', 36, 12);
    t.enu('estimated_yield_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
    t.uuid('location_id').references('location_id').inTable('location');
    t.jsonb('pin_coordinate').notNullable();
    t.text('notes');
  });
  const containers = await knex('container').join('crop_management_plan', 'container.management_plan_id', 'crop_management_plan.management_plan_id');
  for (const container of containers) {
    knex('final_planting_method').insert({
      planting_method: 'CONTAINER_METHOD',
      ...container,
      notes: container.planting_notes || container.notes,
    });
  }
  const beds = await knex('beds').join('crop_management_plan', 'beds.management_plan_id', 'crop_management_plan.management_plan_id');
  for (const bed of beds) {
    knex('final_planting_method').insert({
      planting_method: 'BED_METHOD',
      ...bed,
      notes: bed.planting_notes || bed.notes,
    });
  }

  const rows = await knex('rows').join('crop_management_plan', 'rows.management_plan_id', 'crop_management_plan.management_plan_id');
  for (const row of rows) {
    knex('final_planting_method').insert({
      planting_method: 'ROW_METHOD',
      ...row,
      notes: row.planting_notes || row.notes,
    });
  }

  const broadcasts = await knex('broadcasts').join('crop_management_plan', 'broadcasts.management_plan_id', 'crop_management_plan.management_plan_id');
  for (const broadcast of broadcasts) {
    knex('final_planting_method').insert({
      planting_method: 'BROADCAST_METHOD',
      ...broadcast,
      notes: broadcast.planting_notes || broadcast.notes,
    });
  }

  const transplantContainers = await knex('transplant_container');
  for (const transplantContainer of transplantContainers) {
    knex('initial_planting_method').insert({
      planting_method: 'CONTAINER_METHOD',
      ...transplantContainer,
      notes: transplantContainer.planting_notes || transplantContainer.notes,
    });
  }

  await knex.schema.alterTable('crop_management_plan', (t) => {
    t.date('seed_date');
    t.date('plant_date');
    t.date('germination_date');
    t.date('transplant_date');
    t.date('harvest_date');
    t.date('termination_date');
    t.boolean('already_in_ground').notNullable().defaultTo(false);
    t.boolean('is_seed');
    t.boolean('needs_transplant').notNullable().defaultTo(false);
    t.boolean('for_cover');
    t.boolean('is_wild');
    t.integer('crop_age');
    t.enu('crop_age_unit', ['week', 'month', 'year']);
  });

  const managementPlans = await knex('management_plan');
  for (const managementPlan of managementPlans) {
    knex('crop_management_plan').where('management_plan_id', managementPlan.management_plan_id).update({
      ...managementPlan,
    });
  }

  await knex.schema.alterTable('management_plan', (t) => {
    t.dropColumn('seed_date');
    t.dropColumn('germination_date');
    t.dropColumn('germination_days');
    t.dropColumn('transplant_date');
    t.dropColumn('transplant_days');
    t.dropColumn('harvest_date');
    t.dropColumn('harvest_days');
    t.dropColumn('termination_date');
    t.dropColumn('termination_days');
    t.dropColumn('needs_transplant');
    t.dropColumn('for_cover');
    t.dropColumn('status');
    t.text('notes').alter();
  });

  await knex.schema.alterTable('crop_management_plan', (t) => {
    t.dropColumn('planting_type');
    t.dropColumn('location_id');
    t.dropColumn('estimated_revenue');
    t.dropColumn('estimated_yield');
    t.dropColumn('estimated_yield_unit');
    t.dropColumn('notes');
  });


  await knex.schema.alterTable('farm', t => {
    t.uuid('default_initial_location_id').references('location_id').inTable('location');
  });

  await knex.schema.renameTable('container', 'container_method');
  await knex.schema.renameTable('broadcast', 'broadcast_method');
  await knex.schema.renameTable('bed', 'bed_method');
  await knex.schema.renameTable('row', 'row_method');

  await knex.schema.alterTable('container_method', (t) => {
    t.boolean('is_final_planting_method').primary().defaultTo(true);
  });
  await knex.schema.alterTable('broadcast_method', (t) => {
    t.boolean('is_final_planting_method').primary().defaultTo(true);
  });
  await knex.schema.alterTable('bed_method', (t) => {
    t.boolean('is_final_planting_method').primary().defaultTo(true);
  });
  await knex.schema.alterTable('row_method', (t) => {
    t.boolean('is_final_planting_method').primary().defaultTo(true);
  });


};

exports.down = async function(knex) {
  await knex.schema.dropTable('initial_planting_method');
  await knex.schema.dropTable('final_planting_method');
};
