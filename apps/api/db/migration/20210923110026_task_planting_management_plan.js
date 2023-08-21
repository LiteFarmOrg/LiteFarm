export const up = async function (knex) {
  const managementTasks = await knex('management_tasks');
  await knex.schema.alterTable('management_tasks', (t) => {
    t.uuid('planting_management_plan_id')
      .references('planting_management_plan_id')
      .inTable('planting_management_plan');
  });
  for (const { management_plan_id, task_id } of managementTasks) {
    const { planting_management_plan_id } = await knex('planting_management_plan')
      .where({
        management_plan_id,
        is_final_planting_management_plan: true,
      })
      .first();
    await knex('management_tasks')
      .where({ management_plan_id, task_id })
      .update({ planting_management_plan_id });
  }
  await knex.schema.alterTable('management_tasks', (t) => {
    t.uuid('planting_management_plan_id').notNullable().alter();
    t.dropPrimary('activityCrops_pkey');
    t.primary(['planting_management_plan_id', 'task_id']);
    t.dropColumn('management_plan_id');
  });
};

export const down = async function (knex) {
  const managementTasks = await knex('management_tasks');
  await knex.schema.alterTable('management_tasks', (t) => {
    t.integer('management_plan_id').references('management_plan_id').inTable('management_plan');
  });
  for (const { planting_management_plan_id, task_id } of managementTasks) {
    const { management_plan_id } = await knex('planting_management_plan')
      .where({ planting_management_plan_id })
      .first();
    await knex('management_tasks')
      .where({ planting_management_plan_id, task_id })
      .update({ management_plan_id });
  }
  await knex.schema.alterTable('management_tasks', (t) => {
    t.integer('management_plan_id').notNullable().alter();
    t.dropPrimary();
    t.primary(['management_plan_id', 'task_id']);
    t.dropColumn('planting_management_plan_id');
  });
  await knex.raw(
    'ALTER TABLE management_tasks RENAME CONSTRAINT management_tasks_pkey TO "activityCrops_pkey"',
  );
};
