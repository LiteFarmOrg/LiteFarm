export const up = async function (knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('introduce_map').defaultTo(true).alter();
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('introduce_map').defaultTo(false).alter();
  });
};
