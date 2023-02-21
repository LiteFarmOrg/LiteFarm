export const up = async function (knex) {
  await knex.schema.alterTable('crop_variety', (t) => {
    t.string('crop_varietal').nullable().defaultTo(null);
    t.string('crop_cultivar').nullable().defaultTo(null);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('crop_variety', (t) => {
    t.dropColumn('crop_varietal');
    t.dropColumn('crop_cultivar');
  });
};
