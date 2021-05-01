exports.up = async function(knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('introduce_map').defaultTo(false);
    t.timestamp('introduce_map_end').nullable().defaultTo(null);
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.dropColumn('introduce_map');
    t.dropColumn('introduce_map_end');
  });
};
