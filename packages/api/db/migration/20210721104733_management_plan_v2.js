import lodash from 'lodash';
import plantingMethodModel from '../../src/models/plantingManagementPlanModel.js';
import cropManagementPlanModel from '../../src/models/cropManagementPlanModel.js';
import bedMethodModel from '../../src/models/bedMethodModel.js';
import broadcastMethodModel from '../../src/models/broadcastMethodModel.js';
import containerMethodModel from '../../src/models/containerMethodModel.js';
import rowMethodModel from '../../src/models/rowMethodModel.js';

export const up = async function (knex) {
  await knex.schema.alterTable('farm', (t) => {
    t.uuid('default_initial_location_id').references('location_id').inTable('location');
  });

  await knex.schema.createTable('planting_management_plan', (t) => {
    t.uuid('planting_management_plan_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.integer('management_plan_id')
      .references('management_plan_id')
      .inTable('management_plan')
      .notNullable();
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

  const containers = await knex('container').join(
    'crop_management_plan',
    'container.management_plan_id',
    'crop_management_plan.management_plan_id',
  );
  await knex.batchInsert(
    'planting_management_plan',
    containers.map((container) =>
      lodash.pick(
        {
          planting_method: 'CONTAINER_METHOD',
          is_final_planting_management_plan: true,
          ...container,
          notes: container.planting_notes || container.notes,
          estimated_seeds_unit: 'kg',
          estimated_yield_unit: 'kg',
        },
        plantingMethodProperties,
      ),
    ),
  );

  const beds = await knex('beds').join(
    'crop_management_plan',
    'beds.management_plan_id',
    'crop_management_plan.management_plan_id',
  );
  await knex.batchInsert(
    'planting_management_plan',
    beds.map((bed) =>
      lodash.pick(
        {
          planting_method: 'BED_METHOD',
          is_final_planting_management_plan: true,
          ...bed,
          notes: bed.planting_notes || bed.notes,
          estimated_seeds_unit: 'kg',
          estimated_yield_unit: 'kg',
        },
        plantingMethodProperties,
      ),
    ),
  );

  const rows = await knex('rows').join(
    'crop_management_plan',
    'rows.management_plan_id',
    'crop_management_plan.management_plan_id',
  );
  await knex.batchInsert(
    'planting_management_plan',
    rows.map((row) =>
      lodash.pick(
        {
          planting_method: 'ROW_METHOD',
          is_final_planting_management_plan: true,
          ...row,
          notes: row.planting_notes || row.notes,
          estimated_seeds_unit: 'kg',
          estimated_yield_unit: 'kg',
        },
        plantingMethodProperties,
      ),
    ),
  );

  const broadcasts = await knex('broadcast').join(
    'crop_management_plan',
    'broadcast.management_plan_id',
    'crop_management_plan.management_plan_id',
  );
  await knex.batchInsert(
    'planting_management_plan',
    broadcasts.map((broadcast) =>
      lodash.pick(
        {
          planting_method: 'BROADCAST_METHOD',
          is_final_planting_management_plan: true,
          ...broadcast,
          notes: broadcast.planting_notes || broadcast.notes,
          estimated_seeds_unit: 'kg',
          estimated_yield_unit: 'kg',
        },
        plantingMethodProperties,
      ),
    ),
  );
  for (const broadcast of broadcasts) {
    const figure = await knex('figure').where('location_id', broadcast.location_id).first();
    if (figure) {
      const { total_area } = await knex(figure.type === 'buffer_zone' ? 'line' : 'area')
        .where('figure_id', figure.figure_id)
        .first();
      if (!total_area) {
        await knex('broadcast')
          .where('management_plan_id', broadcast.management_plan_id)
          .update('percentage_planted', 0);
      } else if (broadcast.area_used >= total_area) {
        await knex('broadcast')
          .where('management_plan_id', broadcast.management_plan_id)
          .update('percentage_planted', 100);
      } else {
        await knex('broadcast')
          .where('management_plan_id', broadcast.management_plan_id)
          .update('percentage_planted', broadcast.area_used / total_area);
      }
    }
  }

  const transplantContainers = await knex('transplant_container');
  await knex.batchInsert(
    'planting_management_plan',
    transplantContainers.map((transplantContainer) =>
      lodash.pick(
        {
          planting_method: 'CONTAINER_METHOD',
          is_final_planting_management_plan: false,
          ...transplantContainer,
          notes: transplantContainer.planting_notes || transplantContainer.notes,
          estimated_seeds_unit: 'kg',
          estimated_yield_unit: 'kg',
        },
        plantingMethodProperties,
      ),
    ),
  );

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
  });

  const managementPlans = await knex('management_plan');
  for (const managementPlan of managementPlans) {
    await knex('crop_management_plan')
      .where('management_plan_id', managementPlan.management_plan_id)
      .update(
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
    t.uuid('planting_management_plan_id')
      .primary()
      .references('planting_management_plan_id')
      .inTable('planting_management_plan');
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
    t.uuid('planting_management_plan_id')
      .primary()
      .references('planting_management_plan_id')
      .inTable('planting_management_plan');
    t.decimal('percentage_planted', 15, 12).notNullable();
    t.decimal('area_used', 36, 12).notNullable();
    t.enu('area_used_unit', ['m2', 'ha', 'ft2', 'ac']).defaultTo('m2').notNullable();
    //seeding_rate kg/ha
    t.decimal('seeding_rate', 36, 12).notNullable();
  });
  await knex.schema.createTable('bed_method', (t) => {
    t.uuid('planting_management_plan_id')
      .primary()
      .references('planting_management_plan_id')
      .inTable('planting_management_plan');
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
    t.uuid('planting_management_plan_id')
      .primary()
      .references('planting_management_plan_id')
      .inTable('planting_management_plan');
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
    CONTAINER_METHOD: 'container',
    BROADCAST_METHOD: 'broadcast',
    BED_METHOD: 'beds',
    ROW_METHOD: 'rows',
  };

  const plantingMethodPickerMap = {
    CONTAINER_METHOD: (deprecatedMethod) =>
      lodash.pick(deprecatedMethod, Object.keys(containerMethodModel.jsonSchema.properties)),
    BROADCAST_METHOD: (deprecatedMethod) => {
      return {
        ...lodash.pick(deprecatedMethod, Object.keys(broadcastMethodModel.jsonSchema.properties)),
        seeding_rate: deprecatedMethod.seeding_rate || 0,
        area_used: deprecatedMethod.area_used || 0,
      };
    },
    BED_METHOD: (deprecatedMethod) => {
      const { bed_num, bed_width, bed_length } = deprecatedMethod.bed_config;
      return lodash.pick(
        {
          ...deprecatedMethod,
          number_of_beds: isNaN(bed_num) || !bed_num ? 1 : Math.ceil(Number(bed_num)),
          number_of_rows_in_bed: 1,
          plant_spacing: 0.1,
          bed_width: bed_width || 0,
          bed_length: bed_length || 0,
        },
        Object.keys(bedMethodModel.jsonSchema.properties),
      );
    },
    ROW_METHOD: (deprecatedMethod) =>
      lodash.pick(deprecatedMethod, Object.keys(rowMethodModel.jsonSchema.properties)),
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
      const deprecatedMethod = await knex(
        plantingMethodTableNameMap[plantingManagementPlan.planting_method],
      )
        .where('management_plan_id', plantingManagementPlan.management_plan_id)
        .first();

      await knex(plantingManagementPlan.planting_method.toLowerCase()).insert({
        planting_management_plan_id: plantingManagementPlan.planting_management_plan_id,
        ...getFixedDeprecatedMethod(deprecatedMethod, plantingManagementPlan.planting_method),
      });
    } else {
      const deprecatedMethod = await knex('transplant_container')
        .where('management_plan_id', plantingManagementPlan.management_plan_id)
        .first();
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

export const down = async function (knex) {
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
    t.string('notes');
  });

  await knex.schema.createTable('broadcast', (t) => {
    t.integer('management_plan_id')
      .primary()
      .references('management_plan_id')
      .inTable('crop_management_plan');
    t.decimal('percentage_planted', 15, 12);
    t.decimal('area_used', 36, 12);
    t.enu('area_used_unit', ['m2', 'ha', 'ft2', 'ac']).defaultTo('m2');
    t.decimal('seeding_rate', 36, 12);
    t.decimal('required_seeds', 36, 12);
    t.enu('required_seeds_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
  });

  await knex.schema.createTable('rows', (t) => {
    t.integer('management_plan_id')
      .primary()
      .references('management_plan_id')
      .inTable('crop_management_plan');
    t.boolean('same_length').notNullable();
    t.integer('number_of_rows');
    t.decimal('row_length', 36, 12);
    t.enu('row_length_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.decimal('plant_spacing', 36, 12);
    t.enu('plant_spacing_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.decimal('total_rows_length', 36, 12);
    t.enu('total_rows_length_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.decimal('estimated_yield', 36, 12);
    t.enu('estimated_yield_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
    t.decimal('estimated_seeds', 36, 12);
    t.enu('estimated_seeds_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
    t.string('specify_rows');
    t.decimal('planting_depth', 36, 12);
    t.enu('planting_depth_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.decimal('row_width', 36, 12);
    t.enu('row_width_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.decimal('row_spacing', 36, 12);
    t.enu('row_spacing_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.string('planting_notes');
  });

  await knex.schema.createTable('beds', (t) => {
    t.integer('management_plan_id')
      .primary()
      .references('management_plan_id')
      .inTable('management_plan');
    t.jsonb('bed_config');
    t.decimal('area_used', 36, 12);
    t.enu('area_used_unit', ['m2', 'ha', 'ft2', 'ac']).defaultTo('m2');
    t.integer('number_of_beds');
    t.integer('number_of_rows_in_bed');
    t.integer('plant_spacing');
    t.enu('plant_spacing_unit', ['cm', 'm', 'ft', 'in']);
    t.integer('length_of_bed');
    t.enu('length_of_bed_unit', ['cm', 'm', 'ft', 'in']);
    t.integer('planting_depth');
    t.enu('planting_depth_unit', ['cm', 'm', 'ft', 'in']);
    t.integer('bed_width');
    t.enu('bed_width_unit', ['cm', 'm', 'ft', 'in']);
    t.integer('bed_spacing');
    t.enu('bed_spacing_unit', ['cm', 'm', 'ft', 'in']);
    t.string('planting_notes');
    t.string('specify_beds');
  });

  const containers = await knex('container_method')
    .join(
      'planting_management_plan',
      'planting_management_plan.planting_management_plan_id',
      'container_method.planting_management_plan_id',
    )
    .where('planting_management_plan.is_final_planting_management_plan', true);
  const transplantContainers = await knex('container_method')
    .join(
      'planting_management_plan',
      'planting_management_plan.planting_management_plan_id',
      'container_method.planting_management_plan_id',
    )
    .where('planting_management_plan.is_final_planting_management_plan', false);
  const broadcasts = await knex('broadcast_method')
    .join(
      'planting_management_plan',
      'planting_management_plan.planting_management_plan_id',
      'broadcast_method.planting_management_plan_id',
    )
    .where('planting_management_plan.is_final_planting_management_plan', true);
  const beds = await knex('bed_method')
    .join(
      'planting_management_plan',
      'planting_management_plan.planting_management_plan_id',
      'bed_method.planting_management_plan_id',
    )
    .where('planting_management_plan.is_final_planting_management_plan', true);
  const rows = await knex('row_method')
    .join(
      'planting_management_plan',
      'planting_management_plan.planting_management_plan_id',
      'row_method.planting_management_plan_id',
    )
    .where('planting_management_plan.is_final_planting_management_plan', true);

  function toInteger(object, properties) {
    return Object.keys(object).reduce((result, key) => {
      if (properties.includes(key)) {
        result[key] = Math.ceil(Number(object[key]));
      } else {
        result[key] = object[key];
      }
      return result;
    }, {});
  }

  const plantingMethodsDataMap = {
    container: containers.map((container) =>
      lodash.pick(container, [
        'management_plan_id',
        'in_ground',
        'plant_spacing',
        'total_plants',
        'number_of_containers',
        'plants_per_container',
        'planting_depth',
        'planting_depth_unit',
        'planting_soil',
        'container_type',
      ]),
    ),
    transplant_container: transplantContainers.map((container) =>
      lodash.pick(container, [
        'management_plan_id',
        'location_id',
        'in_ground',
        'plant_spacing',
        'total_plants',
        'number_of_containers',
        'plants_per_container',
        'planting_depth',
        'planting_depth_unit',
        'planting_soil',
        'container_type',
        'notes',
      ]),
    ),
    broadcast: broadcasts.map((broadcast) =>
      lodash.pick(broadcast, [
        'management_plan_id',
        'percentage_planted',
        'area_used',
        'area_used_unit',
        'seeding_rate',
        'required_seeds',
        'required_seeds_unit',
      ]),
    ),
    beds: beds.map((bed) => {
      return {
        ...toInteger(
          lodash.pick(bed, [
            'management_plan_id',
            'area_used',
            'area_used_unit',
            'number_of_beds',
            'number_of_rows_in_bed',
            'plant_spacing',
            'plant_spacing_unit',
            'length_of_bed',
            'length_of_bed_unit',
            'planting_depth',
            'planting_depth_unit',
            'bed_width',
            'bed_width_unit',
            'bed_spacing',
            'bed_spacing_unit',
            'planting_notes',
            'specify_beds',
          ]),
          [
            'number_of_beds',
            'number_of_rows_in_bed',
            'plant_spacing',
            'length_of_bed',
            'planting_depth',
            'bed_width',
            'bed_spacing',
          ],
        ),
        bed_config: {
          bed_num: Number(bed.number_of_beds),
          bed_width: Number(bed.bed_width),
          bed_length: Number(bed.bed_length),
        },
      };
    }),
    rows: rows.map((row) =>
      lodash.pick(row, [
        'management_plan_id',
        'same_length',
        'number_of_rows',
        'row_length',
        'row_length_unit',
        'plant_spacing',
        'plant_spacing_unit',
        'total_rows_length',
        'total_rows_length_unit',
        'estimated_yield',
        'estimated_yield_unit',
        'estimated_seeds',
        'estimated_seeds_unit',
        'specify_rows',
        'planting_depth',
        'planting_depth_unit',
        'row_width',
        'row_width_unit',
        'row_spacing',
        'row_spacing_unit',
        'planting_notes',
      ]),
    ),
  };
  for (const tableName in plantingMethodsDataMap) {
    await knex.batchInsert(tableName, plantingMethodsDataMap[tableName]);
  }

  await knex.schema.alterTable('crop_management_plan', (t) => {
    t.enum('planting_type', ['BROADCAST', 'CONTAINER', 'BEDS', 'ROWS']);
    t.uuid('location_id').references('location_id').inTable('location');
    t.decimal('estimated_yield', 36, 12);
    t.enu('estimated_yield_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
    t.text('notes');
  });

  for (const tableName in plantingMethodsDataMap) {
    if (tableName !== 'transplant_container') {
      const planting_type = tableName.toUpperCase();
      for (const crop_management_plan of plantingMethodsDataMap[tableName]) {
        const { location_id, estimated_yield, estimated_yield_unit, notes } = crop_management_plan;
        await knex('crop_management_plan')
          .where({ management_plan_id: crop_management_plan.management_plan_id })
          .update({
            planting_type,
            location_id,
            estimated_yield,
            estimated_yield_unit,
            notes,
          });
      }
    }
  }

  await knex.schema.alterTable('management_plan', (t) => {
    t.date('seed_date');
    t.date('germination_date');
    t.date('transplant_date');
    t.date('harvest_date');
    t.date('termination_date');
    t.boolean('needs_transplant').notNullable().defaultTo(false);
    t.boolean('for_cover');
    t.date('completed_date');
    t.date('abandoned_date');
    t.enu('status', ['ACTIVE', 'PLANNED', 'COMPLETED', 'ABANDONED']).defaultTo('PLANNED');
    t.string('notes').alter();
    t.integer('transplant_days').unsigned();
    t.integer('germination_days').unsigned();
    t.integer('termination_days').unsigned();
    t.integer('harvest_days').unsigned();
    t.dropColumn('complete_date');
    t.dropColumn('abandon_date');
  });

  const managementPlans = await knex('crop_management_plan');
  for (const {
    seed_date,
    germination_date,
    transplant_date,
    harvest_date,
    termination_date,
    // eslint-disable-next-line no-unused-vars
    is_seed,
    needs_transplant,
    for_cover,
    // eslint-disable-next-line no-unused-vars
    is_wild,
    management_plan_id,
  } of managementPlans) {
    await knex('management_plan').where('management_plan_id', management_plan_id).update({
      seed_date,
      germination_date,
      transplant_date,
      harvest_date,
      termination_date,
      needs_transplant,
      for_cover,
    });
  }
  await knex.schema.alterTable('crop_management_plan', (t) => {
    t.dropColumn('seed_date');
    t.dropColumn('plant_date');
    t.dropColumn('germination_date');
    t.dropColumn('transplant_date');
    t.dropColumn('harvest_date');
    t.dropColumn('termination_date');
    t.dropColumn('already_in_ground');
    t.dropColumn('is_seed');
    t.dropColumn('needs_transplant');
    t.dropColumn('for_cover');
    t.dropColumn('is_wild');
  });

  await knex.schema.dropTable('container_method');
  await knex.schema.dropTable('bed_method');
  await knex.schema.dropTable('row_method');
  await knex.schema.dropTable('broadcast_method');
  await knex.schema.dropTable('planting_management_plan');
  await knex.schema.alterTable('farm', (t) => {
    t.dropColumn('default_initial_location_id');
  });
};
