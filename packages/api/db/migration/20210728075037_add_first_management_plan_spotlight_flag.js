exports.up = async function(knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('management_plan_creation').defaultTo(false);
    t.timestamp('management_plan_creation_end').nullable().defaultTo(null);
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.dropColumn('management_plan_creation');
    t.dropColumn('management_plan_creation_end');
  });
};