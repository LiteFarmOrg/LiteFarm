export const up = async function (knex) {
  return knex.schema.alterTable('planting_management_plan', (t) => {
    t.enu('planting_task_type', ['PLANT_TASK', 'TRANSPLANT_TASK']);
  });
};

export const down = async function (knex) {
  return knex.schema.alterTable('planting_management_plan', (t) => {
    t.dropColumn('planting_task_type');
  });
};
