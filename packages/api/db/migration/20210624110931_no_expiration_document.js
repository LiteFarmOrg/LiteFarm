
exports.up = function(knex) {
  return knex.schema.alterTable('document', (t) => {
    t.boolean('no_expiration').defaultTo(false);
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('document', (t) => {
    t.dropColumn('no_expiration');
  })
};
