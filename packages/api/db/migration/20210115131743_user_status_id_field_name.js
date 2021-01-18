
exports.up = function(knex) {
  return knex.schema.alterTable('users', t=>{
    t.renameColumn('status', 'status_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', t=>{
    t.renameColumn('status_id', 'status');
  });
};
