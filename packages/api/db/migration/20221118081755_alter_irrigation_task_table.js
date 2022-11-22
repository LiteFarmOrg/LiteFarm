export const up = async function (knex) {
  const irrigation_task_rows = await knex('irrigation_task').select(
    'task_id',
    'flow_rate_l/min',
    'hours',
  );

  await knex.schema.alterTable('irrigation_task', (table) => {
    table.renameColumn('hours', 'estimated_duration');
    table.renameColumn('flow_rate_l/min', 'estimated_flow_rate');
    table.string('estimated_flow_rate_unit');
    table.uuid('location_id').references('location_id').inTable('location');
    table.float('estimated_water_usage');
    table.string('estimated_water_usage_unit');
    table.float('application_depth');
    table.string('application_depth_unit');
  });

  for (const row of irrigation_task_rows) {
    await knex.raw(
      `UPDATE "task" task SET duration = ${row.hours * 60} WHERE task.task_id = row.task_id`,
    );
    await knex('irrigation_task').insert({ estimated_flow_rate_unit: 'l/min' });
  }
};

export const down = async function (knex) {
  const task_rows = await knex('task').select('task_id', 'duration');

  await knex.schema.alterTable('irrigation_task', (table) => {
    table.renameColumn('estimated_duration', 'hours');
    table.renameColumn('estimated_flow_rate', 'flow_rate_l/min');
    table.dropColumn('estimated_flow_rate_unit');
    table.dropColumn('location_id');
    table.dropColumn('estimated_water_usage');
    table.dropColumn('estimated_water_usage_unit');
    table.dropColumn('application_depth');
    table.dropColumn('application_depth_unit');
  });

  for (const row of task_rows) {
    await knex.raw(
      `UPDATE 'irrigation_task' task SET hours = ${
        row.duration / 60
      } WHERE task.task_id = row.task_id`,
    );
  }
};
