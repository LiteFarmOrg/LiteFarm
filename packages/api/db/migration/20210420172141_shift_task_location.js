
exports.up = function(knex) {
  return knex.schema.alterTable('shiftTask', (t) => {
    t.renameColumn('is_field', 'is_location')
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('shiftTask', (t) => {
    t.renameColumn('is_location', 'is_field')
  });
};
