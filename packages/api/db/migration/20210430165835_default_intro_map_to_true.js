
exports.up = async function(knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('introduce_map').defaultTo(true).alter();
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('introduce_map').defaultTo(false).alter();
  });
};
