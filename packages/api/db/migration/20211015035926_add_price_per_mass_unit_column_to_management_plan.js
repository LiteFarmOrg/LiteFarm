
exports.up = function(knex) {
  return knex.schema.alterTable('crop_management_plan', (t) => {
    t.decimal('estimated_price_per_mass', 36, 12);
    t.enu('estimated_price_per_mass_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('crop_management_plan', (t) => {
    t.dropColumn('estimated_price_per_mass');
    t.dropColumn('estimated_price_per_mass_unit');
  });
};
