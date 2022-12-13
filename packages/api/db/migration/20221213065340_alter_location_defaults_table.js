export const up = async function (knex) {
  const irrigation_task_rows = await knex('irrigation_task').select(
    'location_id',
    'default_location_flow_rate',
    'default_location_application_depth',
    'default_irrigation_task_type_location',
  );

  await knex.schema.alterTable('location_defaults', (table) => {
    table.boolean('default_location_flow_rate').defaultTo(false);
    table.boolean('default_location_application_depth').defaultTo(false);
    table.boolean('default_location_irrigation_task_type').defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
    table.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
    table.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    table.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });

  for (const row of irrigation_task_rows) {
    await knex('location_defaults')
      .update({ default_location_flow_rate: row.default_location_flow_rate })
      .where({ location_id: row.location_id });
    await knex('location_defaults')
      .update({ default_location_application_depth: row.default_location_application_depth })
      .where({ location_id: row.location_id });
    await knex('location_defaults')
      .update({ default_location_irrigation_task_type: row.default_irrigation_task_type_location })
      .where({ location_id: row.location_id });
  }
};

export const down = async function (knex) {
  await knex.schema.alterTable('location_defaults', (table) => {
    table.dropColumn('created_by_user_id');
    table.dropColumn('updated_by_user_id');
    table.dropColumn('created_at');
    table.dropColumn('updated_at');
    table.dropColumn('deleted');
    table.dropColumn('default_location_flow_rate');
    table.dropColumn('default_location_application_depth');
    table.dropColumn('default_location_irrigation_task_type');
  });
};
