export const up = function (knex) {
  return knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('crop_variety_detail').defaultTo(false);
    t.timestamp('crop_variety_detail_end').nullable().defaultTo(null);
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('showedSpotlight', (t) => {
    t.dropColumn('crop_variety_detail');
    t.dropColumn('crop_variety_detail_end');
  });
};
