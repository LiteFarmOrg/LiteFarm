export const up = function (knex) {
  return knex.schema.alterTable('transplant_task', (t) => {
    t.uuid('prev_planting_management_plan_id')
      .references('planting_management_plan_id')
      .inTable('planting_management_plan');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('transplant_task', (t) => {
    t.dropColumn('prev_planting_management_plan_id');
  });
};
