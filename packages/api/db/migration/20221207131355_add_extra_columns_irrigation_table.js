export const up = async function (knex) {
  await knex.schema.alterTable('irrigation_task', (table) => {
    table.float('irrigated_area');
    table.string('irrigated_area_unit');
    table.string('location_size_unit');
    table.float('percentage_location_irrigated');
    table.string('percentage_location_irrigated_unit');
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
    table.dropColumn('percentage_location_irrigated_unit');
    table.dropColumn('default_location_flow_rate');
    table.dropColumn('default_irrigation_task_type_location');
    table.dropColumn('default_irrigation_task_type_measurement');
    table.dropColumn('default_location_application_depth');
  });
};
