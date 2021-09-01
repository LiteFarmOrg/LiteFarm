exports.up = function(knex) {
  return knex.schema.alterTable('task', t => {
    t.renameColumn('type', 'task_type_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('task', t => {
    t.renameColumn('task_type_id', 'type');
  });
};
