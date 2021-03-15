
exports.up = function(knex) {
  return knex.schema.alterTable('water_valve', (t) => {
    t.decimal('flow_rate', 24, 2);
    t.enu('flow_rate_unit', ['l/min', 'l/hour', 'g/min', 'g/hour']);
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('water_valve', (t) => {
    t.dropColumn('flow_rate');
    t.dropColumn('flow_rate_unit');
  })
};
