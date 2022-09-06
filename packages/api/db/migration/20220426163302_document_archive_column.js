export const up = async function (knex) {
  await knex.schema.table('document', (t) => {
    t.boolean('archived').defaultTo(false).notNullable();
  });
  await knex('document').where({ valid_until: '2000-01-01' }).update({ archived: true });
};

export const down = function (knex) {
  return knex.schema.table('document', (t) => {
    t.dropColumn('archived');
  });
};
