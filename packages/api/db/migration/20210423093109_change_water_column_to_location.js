
exports.up = function(knex) {
  return knex.schema.alterTable('waterBalance', (t) => {
    t.renameColumn('field_id', 'location_id')
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('waterBalance', (t) => {
    t.renameColumn('location_id', 'field_id')
  });
};
