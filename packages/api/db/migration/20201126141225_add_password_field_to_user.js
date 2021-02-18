
exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.string('password_hash');
    }),
  ])
};
  
exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('password_hash');
    }),
  ])
};
