exports.up = function(knex) {
  return knex.schema.alterTable('transplant_task', t => {
    t.uuid('planting_management_plan_id').references('planting_management_plan_id').inTable('planting_management_plan');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('transplant_task', t => {
    t.dropColumn('planting_management_plan_id');
  });
};
