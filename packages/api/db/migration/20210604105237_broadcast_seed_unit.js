
exports.up = function(knex) {
  return knex.schema.alterTable('broadcast', (t) => {
    t.enu('required_seeds_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('broadcast', (t) => {
    t.dropColumn('required_seeds_unit');
  })
};
