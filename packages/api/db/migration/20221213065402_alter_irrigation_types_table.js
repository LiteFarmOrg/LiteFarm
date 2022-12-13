export const up = async function (knex) {
  const irrigation_task_rows = await knex('irrigation_task').select(
    'type',
    'default_irrigation_task_type_measurement',
  );
  await knex.schema.alterTable('irrigation_type', (table) => {
    table.boolean('default_irrigation_task_type_measurement').defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
    table.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
    table.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    table.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });

  for (const row of irrigation_task_rows) {
    await knex('irrigation_type')
      .update({
        default_irrigation_task_type_measurement: row.default_irrigation_task_type_measurement,
      })
      .where({ irrigation_type_name: row.type })
      .whereNotNull('farm_id');
  }
};

export const down = async function (knex) {
  await knex.schema.alterTable('irrigation_type', (table) => {
    table.dropColumn('created_by_user_id');
    table.dropColumn('updated_by_user_id');
    table.dropColumn('created_at');
    table.dropColumn('updated_at');
    table.dropColumn('deleted');
    table.dropColumn('default_irrigation_task_type_measurement');
  });
};
