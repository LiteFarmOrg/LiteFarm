
exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('farm', (table) => {
      table.dropColumn('sandbox_bool');
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('farm', (table) => {
      table.boolean('sandbox_bool').notNullable().defaultTo(false);
    }),
  ])
};
