export const up = async function (knex) {
  const saleTaskTypes = await knex('task_type').where({
    task_name: 'Sales',
    farm_id: null,
    task_translation_key: 'SALES',
  });
  const sortedTasks = saleTaskTypes.sort((task0, task1) => task1.task_type_id - task0.task_type_id);
  const duplicateSaleTask = sortedTasks.length === 2 ? sortedTasks[0] : undefined;
  if (duplicateSaleTask) {
    await knex('task_type').where({ task_type_id: duplicateSaleTask.task_type_id }).delete();
  }
};

export const down = function (knex) {
  return knex('task_type').insert({
    task_name: 'Sales',
    farm_id: null,
    deleted: false,
    created_by_user_id: '1',
    updated_by_user_id: '1',
    created_at: '2000-01-01 00:00:00.000000 +00:00',
    updated_at: '2000-01-01 00:00:00.000000 +00:00',
    task_translation_key: 'SALES',
  });
};
