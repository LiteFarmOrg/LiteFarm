
exports.up = function(knex) {
  return knex.schema.alterTable('farm', (t) => {
    t.boolean('owner_operated').defaultTo(null);
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('farm', (t) => {
    t.dropColumn('owner_operated');
  })
};
