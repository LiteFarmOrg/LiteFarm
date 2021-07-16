
exports.up = async function(knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('transplant').defaultTo(false);
    t.timestamp('transplant_end').nullable().defaultTo(null);
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.dropColumn('transplant');
    t.dropColumn('transplant_end');
  });
};
