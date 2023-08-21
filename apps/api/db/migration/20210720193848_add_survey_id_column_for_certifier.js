export const up = async function (knex) {
  await knex.schema.alterTable('certifiers', (t) => {
    t.string('survey_id').defaultTo(null);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('certifiers', (t) => {
    t.dropColumn('survey_id');
  });
};
