exports.up = function(knex) {
  return knex.schema.createTable('transplant_task', t => {
    t.uuid('planting_management_plan_id').primary().references('planting_management_plan_id').inTable('planting_management_plan');
    t.integer('task_id').references('task_id').inTable('task');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transplant_task');
};
