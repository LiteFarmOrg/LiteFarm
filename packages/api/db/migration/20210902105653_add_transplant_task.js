export const up = async function (knex) {
  return Promise.all([
    knex('task_type')
      .where({
        task_name: 'Planting',
        farm_id: null,
        task_translation_key: 'PLANTING_TASK',
      })
      .update({ task_translation_key: 'PLANT_TASK' }),
    knex('task_type').insert({
      task_name: 'Transplant',
      farm_id: null,
      task_translation_key: 'TRANSPLANT_TASK',
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('task_type')
      .where({
        task_name: 'Planting',
        farm_id: null,
        task_translation_key: 'PLANT_TASK',
      })
      .update({ task_translation_key: 'PLANTING_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Transplant',
        farm_id: null,
        task_translation_key: 'TRANSPLANT_TASK',
      })
      .delete(),
  ]);
};
