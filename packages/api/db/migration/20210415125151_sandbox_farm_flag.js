exports.up = function(knex) {
  return knex.schema.alterTable('farm', (t) => {
    t.boolean('sandbox_farm').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('farm', (t) => {
    t.dropColumn('sandbox_farm');
  });
};
