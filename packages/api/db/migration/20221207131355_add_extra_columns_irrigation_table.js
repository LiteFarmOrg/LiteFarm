export const up = async function (knex) {
  await knex.schema.alterTable('irrigation_task', (table) => {
    table.integer('irrigation_type_id').references('irrigation_type_id').inTable('irrigation_type');
    table.decimal('irrigated_area', 36, 12);
    table.enu('irrigated_area_unit', ['m2', 'ha', 'ft2', 'ac']).defaultTo('m2');
    table.string('location_size_unit');
    table.float('percentage_location_irrigated');
    table.boolean('default_location_application_depth').defaultTo(false);
    table.boolean('default_irrigation_task_type_location').defaultTo(false);
    table.boolean('default_irrigation_task_type_measurement').defaultTo(false);
    table.boolean('default_location_flow_rate').defaultTo(false);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('irrigation_task', (table) => {
    table.dropColumn('irrigated_area');
    table.dropColumn('irrigated_area_unit');
    table.dropColumn('location_size_unit');
    table.dropColumn('percentage_location_irrigated');
    table.dropColumn('default_location_flow_rate');
    table.dropColumn('default_irrigation_task_type_location');
    table.dropColumn('default_irrigation_task_type_measurement');
    table.dropColumn('default_location_application_depth');
  });
};
