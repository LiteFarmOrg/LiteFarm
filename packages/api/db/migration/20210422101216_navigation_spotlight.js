exports.up = async function(knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('navigation').defaultTo(false);
    t.timestamp('navigation_end').nullable().defaultTo(null);
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.dropColumn('navigation');
    t.dropColumn('navigation_end');
  });
};
