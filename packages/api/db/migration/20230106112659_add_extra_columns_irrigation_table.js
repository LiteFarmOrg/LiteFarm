export const up = async function (knex) {
  await knex.schema.alterTable('irrigation_task', (table) => {
    table.boolean('default_location_flow_rate').defaultTo(false);
    table.boolean('default_location_application_depth').defaultTo(false);
    table.boolean('default_irrigation_task_type_location').defaultTo(false);
    table.boolean('default_irrigation_task_type_measurement').defaultTo(false);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('irrigation_task', (table) => {
    table.dropColumn('default_location_flow_rate');
    table.dropColumn('default_location_application_depth');
    table.dropColumn('default_irrigation_task_type_location');
    table.dropColumn('default_irrigation_task_type_measurement');
  });
};
