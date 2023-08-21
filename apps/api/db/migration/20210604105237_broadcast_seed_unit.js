export const up = function (knex) {
  return knex.schema.alterTable('broadcast', (t) => {
    t.enu('required_seeds_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('broadcast', (t) => {
    t.dropColumn('required_seeds_unit');
  });
};
