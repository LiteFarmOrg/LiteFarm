
exports.up = function(knex) {
  return knex.schema.alterTable('line', (t) => {
    t.decimal('total_area', 36, 12);
    t.enu('total_area_unit', ['m2', 'ha', 'ft2', 'ac']).defaultTo('m2');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('line', (t) => {
    t.dropColumn('total_area');
    t.dropColumn('total_area_unit');
  });
};
