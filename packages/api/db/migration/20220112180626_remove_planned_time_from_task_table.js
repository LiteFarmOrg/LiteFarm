export const up = function (knex) {
  return knex.schema.alterTable('task', function (table) {
    table.dropColumn('planned_time');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('task', function (table) {
    table.dateTime('planned_time');
  });
  const tasks = await knex('task');
  for (const { task_id, due_date } of tasks) {
    await knex('task').where('task_id', task_id).update({
      planned_time: due_date,
    });
  }
};
