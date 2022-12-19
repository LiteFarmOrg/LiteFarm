export const up = async function (knex) {
  const irrigation_task_type = await knex('irrigation_type').select(
    'irrigation_type_id',
    'irrigation_type_name',
  );
  const irrigation_task = await knex('irrigation_task').select('type');
  await knex.schema.alterTable('irrigation_task', (table) => {
    table.integer('irrigation_type_id').references('irrigation_type_id').inTable('irrigation_type');
  });
  await knex.schema.raw(`ALTER TABLE irrigation_task DROP CONSTRAINT "irrigationLog_type_check";`);
  const irrigation_task_data = irrigation_task.map((row) => ({
    type: row.type,
    formattedType: row.type === 'subsurface' ? 'SUB_SURFACE' : row.type,
    irrigation_type: irrigation_task_type.filter(
      (task) =>
        task.irrigation_type_name.toUpperCase() ===
        (row.type === 'subsurface' ? 'SUB_SURFACE' : row.type).toUpperCase(),
    )[0],
  }));

  for (const row of irrigation_task_data) {
    await knex('irrigation_task').update({ type: row.formattedType }).where({ type: row.type });
    await knex('irrigation_task')
      .update({ irrigation_type_id: row.irrigation_type.irrigation_type_id })
      .where({ type: row.formattedType });
  }

  await knex.schema.alterTable('irrigation_task', (table) => {
    table.decimal('estimated_flow_rate', 36, 12).alter();
    table.decimal('estimated_water_usage', 36, 12).alter();
    table.decimal('application_depth', 36, 12).alter();
    table.renameColumn('type', 'irrigation_type_name');
    table.renameColumn('default_measuring_type', 'measuring_type');
    table.float('percent_of_location_irrigated');
    table.dropColumn('default_location_flow_rate');
    table.dropColumn('default_location_application_depth');
    table.dropColumn('default_irrigation_task_type_location');
    table.dropColumn('default_irrigation_task_type_measurement');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('irrigation_task', (table) => {
    table.dropColumn('percent_of_location_irrigated');
    table.renameColumn('irrigation_type_name', 'type');
    table.renameColumn('measuring_type', 'default_measuring_type');
  });
};
