const lodash = require('lodash');
const plantingMethodModel = require('../../src/models/plantingManagementPlanModel');
const cropManagementPlanModel = require('../../src/models/cropManagementPlanModel');
const bedMethodModel = require('../../src/models/bedMethodModel');
const broadcastMethodModel = require('../../src/models/broadcastMethodModel');
const containerMethodModel = require('../../src/models/containerMethodModel');
const rowMethodModel = require('../../src/models/rowMethodModel');
exports.up = async function(knex) {
  await knex.schema.alterTable('farm', t => {
    t.uuid('default_initial_location_id').references('location_id').inTable('location');
  });

  await knex.schema.createTable('planting_management_plan', t => {
    t.uuid('planting_management_plan_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.integer('management_plan_id').references('management_plan_id').inTable('management_plan').notNullable();
    t.boolean('is_final_planting_management_plan').defaultTo(true).notNullable();
    t.unique(['management_plan_id', 'is_final_planting_management_plan']);
    t.enu('planting_method', ['BROADCAST_METHOD', 'CONTAINER_METHOD', 'BED_METHOD', 'ROW_METHOD']);
    t.boolean('is_planting_method_known');
    t.decimal('estimated_seeds', 36, 12);
    t.enu('estimated_seeds_unit', ['g', 'kg', 'oz', 'lb']).defaultTo('kg');
    t.decimal('estimated_yield', 36, 12);
    t.enu('estimated_yield_unit', ['kg', 'lb', 'mt', 't']).defaultTo('kg');
    t.uuid('location_id').references('location_id').inTable('location');
    t.jsonb('pin_coordinate');
    t.text('notes');
  });
  const plantingMethodProperties = Object.keys(plantingMethodModel.jsonSchema.properties);

  const containers = await knex('container').join('crop_management_plan', 'container.management_plan_id', 'crop_management_plan.management_plan_id');
  await knex.batchInsert('planting_management_plan', containers.map(container => lodash.pick({
    planting_method: 'CONTAINER_METHOD',
    is_final_planting_management_plan: true,
    ...container,
    notes: container.planting_notes || container.notes,
    estimated_seeds_unit: 'kg',
    estimated_yield_unit: 'kg',
  }, plantingMethodProperties)));

  const beds = await knex('beds').join('crop_management_plan', 'beds.management_plan_id', 'crop_management_plan.management_plan_id');
  await knex.batchInsert('planting_management_plan', beds.map(bed => lodash.pick({
    planting_method: 'BED_METHOD',
    is_final_planting_management_plan: true,
    ...bed,
    notes: bed.planting_notes || bed.notes,
    estimated_seeds_unit: 'kg',
    estimated_yield_unit: 'kg',
  }, plantingMethodProperties)));

  const rows = await knex('rows').join('crop_management_plan', 'rows.management_plan_id', 'crop_management_plan.management_plan_id');
  await knex.batchInsert('planting_management_plan', rows.map(row => lodash.pick({
    planting_method: 'ROW_METHOD',
    is_final_planting_management_plan: true,
    ...row,
    notes: row.planting_notes || row.notes,
    estimated_seeds_unit: 'kg',
    estimated_yield_unit: 'kg',
  }, plantingMethodProperties)));

  const broadcasts = await knex('broadcast').join('crop_management_plan', 'broadcast.management_plan_id', 'crop_management_plan.management_plan_id');
  await knex.batchInsert('planting_management_plan', broadcasts.map(broadcast => lodash.pick({
    planting_method: 'BROADCAST_METHOD',
    is_final_planting_management_plan: true,
    ...broadcast,
    notes: broadcast.planting_notes || broadcast.notes,
    estimated_seeds_unit: 'kg',
    estimated_yield_unit: 'kg',
  }, plantingMethodProperties)));
  for (const broadcast of broadcasts) {
    const figure = await knex('figure').where('location_id', broadcast.location_id).first();
    const { total_area } = await knex(figure.type === 'buffer_zone' ? 'line' : 'area').where('figure_id', figure.figure_id).first();
    if (!total_area) {
      await knex('broadcast').where('management_plan_id', broadcast.management_plan_id).update('percentage_planted', 0);
    } else if (broadcast.area_used >= total_area) {
      await knex('broadcast').where('management_plan_id', broadcast.management_plan_id).update('percentage_planted', 100);
    } else {
      await knex('broadcast').where('management_plan_id', broadcast.management_plan_id).update('percentage_planted', broadcast.area_used / total_area);
    }
  }

  const transplantContainers = await knex('transplant_container');
  await knex.batchInsert('planting_management_plan', transplantContainers.map(transplantContainer => lodash.pick({
    planting_method: 'CONTAINER_METHOD',
    is_final_planting_management_plan: false,
    ...transplantContainer,
    notes: transplantContainer.planting_notes || transplantContainer.notes,
    estimated_seeds_unit: 'kg',
    estimated_yield_unit: 'kg',
  }, plantingMethodProperties)));

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
    await knex('crop_management_plan').where('management_plan_id', managementPlan.management_plan_id).update(
      lodash.pick(managementPlan, Object.keys(cropManagementPlanModel.jsonSchema.properties)),
    );
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
    t.dropColumn('completed_date');
    t.dropColumn('abandoned_date');
    t.date('complete_date');
    t.date('abandon_date');
    t.text('notes').alter();
  });

  await knex.schema.alterTable('crop_management_plan', (t) => {
    t.dropColumn('planting_type');
    t.dropColumn('location_id');
    t.dropColumn('estimated_yield');
    t.dropColumn('estimated_yield_unit');
    t.dropColumn('notes');
  });

  await knex.schema.createTable('container_method', (t) => {
    t.uuid('planting_management_plan_id').primary().references('planting_management_plan_id').inTable('planting_management_plan');
    t.boolean('in_ground').notNullable();
    t.decimal('plant_spacing', 36, 12);
    t.enu('plant_spacing_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    t.integer('total_plants');
    t.integer('number_of_containers');
    t.integer('plants_per_container');
    t.decimal('planting_depth', 36, 12);
    t.enu('planting_depth_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    t.string('planting_soil');
    t.string('container_type');
  });

  await knex.schema.createTable('broadcast_method', (t) => {
    t.uuid('planting_management_plan_id').primary().references('planting_management_plan_id').inTable('planting_management_plan');
    t.decimal('percentage_planted', 15, 12).notNullable();
    t.decimal('area_used', 36, 12).notNullable();
    t.enu('area_used_unit', ['m2', 'ha', 'ft2', 'ac']).defaultTo('m2').notNullable();
    //seeding_rate kg/ha
    t.decimal('seeding_rate', 36, 12).notNullable();
  });
  await knex.schema.createTable('bed_method', (t) => {
    t.uuid('planting_management_plan_id').primary().references('planting_management_plan_id').inTable('planting_management_plan');
    t.integer('number_of_beds').notNullable();
    t.integer('number_of_rows_in_bed').notNullable();
    t.decimal('plant_spacing', 36, 12).notNullable();
    t.enu('plant_spacing_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    t.decimal('bed_length', 36, 12).notNullable();
    t.enu('bed_length_unit', ['cm', 'm', 'ft', 'in']).defaultTo('m');
    t.decimal('planting_depth', 36, 12);
    t.enu('planting_depth_unit', ['cm', 'm', 'ft', 'in']).defaultTo('cm');
    t.decimal('bed_width', 36, 12);
    t.enu('bed_width_unit', ['cm', 'm', 'ft', 'in']).defaultTo('m');
    t.decimal('bed_spacing', 36, 12);
    t.enu('bed_spacing_unit', ['cm', 'm', 'ft', 'in']).defaultTo('m');
    t.string('specify_beds');
  });
  await knex.schema.createTable('row_method', (t) => {
    t.uuid('planting_management_plan_id').primary().references('planting_management_plan_id').inTable('planting_management_plan');
    t.boolean('same_length').notNullable();
    t.integer('number_of_rows');
    t.decimal('row_length', 36, 12);
    t.enu('row_length_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    t.decimal('plant_spacing', 36, 12).notNullable();
    t.enu('plant_spacing_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    t.decimal('total_rows_length', 36, 12);
    t.enu('total_rows_length_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    t.string('specify_rows');
    t.decimal('planting_depth', 36, 12);
    t.enu('planting_depth_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    t.decimal('row_width', 36, 12);
    t.enu('row_width_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    t.decimal('row_spacing', 36, 12);
    t.enu('row_spacing_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
  });

  const plantingManagementPlans = await knex('planting_management_plan');

  const plantingMethodTableNameMap = {
    'CONTAINER_METHOD': 'container',
    'BROADCAST_METHOD': 'broadcast',
    'BED_METHOD': 'beds',
    'ROW_METHOD': 'rows',
  };

  const plantingMethodPickerMap = {
    'CONTAINER_METHOD': deprecatedMethod => lodash.pick(deprecatedMethod, Object.keys(containerMethodModel.jsonSchema.properties)),
    'BROADCAST_METHOD': deprecatedMethod => {
      return {
        ...lodash.pick(deprecatedMethod, Object.keys(broadcastMethodModel.jsonSchema.properties)),
        seeding_rate: deprecatedMethod.seeding_rate || 0,
        area_used: deprecatedMethod.area_used || 0,
      };
    },
    'BED_METHOD': deprecatedMethod => {
      const { bed_num, bed_width, bed_length } = deprecatedMethod.bed_config;
      return lodash.pick({
        ...deprecatedMethod,
        number_of_beds: (isNaN(bed_num) || !bed_num) ? 1 : Math.ceil(Number(bed_num)),
        number_of_rows_in_bed: 1,
        plant_spacing: 0.1,
        bed_width: bed_width || 0,
        bed_length: bed_length || 0,
      }, Object.keys(bedMethodModel.jsonSchema.properties));
    },
    'ROW_METHOD': deprecatedMethod => lodash.pick(deprecatedMethod, Object.keys(rowMethodModel.jsonSchema.properties)),
  };


  const getFixedDeprecatedMethod = (deprecatedMethod, planting_method) => {
    const result = { ...deprecatedMethod };
    for (const key in deprecatedMethod) {
      switch (deprecatedMethod[key]) {
      case 'km':
        deprecatedMethod[key] = 'm';
        break;
      case 'mi':
        deprecatedMethod[key] = 'ft';
        break;
      }
    }
    return plantingMethodPickerMap[planting_method](result);
  };

  for (const plantingManagementPlan of plantingManagementPlans) {
    if (plantingManagementPlan.is_final_planting_management_plan) {
      const deprecatedMethod = await knex(plantingMethodTableNameMap[plantingManagementPlan.planting_method]).where('management_plan_id', plantingManagementPlan.management_plan_id).first();

      await knex(plantingManagementPlan.planting_method.toLowerCase()).insert({
        planting_management_plan_id: plantingManagementPlan.planting_management_plan_id,
        ...getFixedDeprecatedMethod(deprecatedMethod, plantingManagementPlan.planting_method),
      });
    } else {
      const deprecatedMethod = await knex('transplant_container').where('management_plan_id', plantingManagementPlan.management_plan_id).first();
      await knex(plantingManagementPlan.planting_method.toLowerCase()).insert({
        planting_management_plan_id: plantingManagementPlan.planting_management_plan_id,
        ...getFixedDeprecatedMethod(deprecatedMethod, plantingManagementPlan.planting_method),
      });
    }
  }

  await knex.schema.dropTable('container');
  await knex.schema.dropTable('transplant_container');
  await knex.schema.dropTable('beds');
  await knex.schema.dropTable('broadcast');
  await knex.schema.dropTable('rows');
};

exports.down = async function(knex) {

};
