export const up = async function (knex) {
  await knex.schema.alterTable('field_work_type', (t) => {
    t.boolean('deleted').defaultTo(false);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('field_work_type', (t) => {
    t.dropColumn('deleted');
  });
};
