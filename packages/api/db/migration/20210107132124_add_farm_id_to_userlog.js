
exports.up = function(knex) {
  return knex.schema.alterTable('userLog', (t) => {
    t.foreign('farm_id').references('farm_id').inTable('farm');
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('userLog', (t) => {
    t.dropColumn('farm_id');
  })
};
