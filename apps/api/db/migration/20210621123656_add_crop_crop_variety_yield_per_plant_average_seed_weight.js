export const up = function (knex) {
  return Promise.all([
    knex.schema.alterTable('crop_variety', (t) => {
      t.decimal('average_seed_weight', 36, 12);
      t.decimal('yield_per_plant', 36, 12);
    }),
    knex.schema.alterTable('crop', (t) => {
      t.decimal('average_seed_weight', 36, 12);
      t.decimal('yield_per_plant', 36, 12);
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.schema.alterTable('crop_variety', (t) => {
      t.dropColumn('average_seed_weight');
      t.dropColumn('yield_per_plant');
    }),
    knex.schema.alterTable('crop', (t) => {
      t.dropColumn('average_seed_weight');
      t.dropColumn('yield_per_plant');
    }),
  ]);
};
