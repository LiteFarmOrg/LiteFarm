export const up = function (knex) {
  return Promise.all([
    knex.schema.alterTable('crop_variety', (t) => {
      t.boolean('can_be_cover_crop');
      t.integer('planting_depth');
      t.decimal('yield_per_area', 36, 12);
    }),
    knex.schema.alterTable('crop', (t) => {
      t.boolean('can_be_cover_crop');
      t.integer('planting_depth');
      t.decimal('yield_per_area', 36, 12);
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.schema.alterTable('crop_variety', (t) => {
      t.dropColumn('can_be_cover_crop');
      t.dropColumn('planting_depth');
      t.dropColumn('yield_per_area');
    }),
    knex.schema.alterTable('crop', (t) => {
      t.dropColumn('can_be_cover_crop');
      t.dropColumn('planting_depth');
      t.dropColumn('yield_per_area');
    }),
  ]);
};
