export const up = function (knex) {
  return Promise.all([
    knex.schema.table('farm', (table) => {
      table.dropColumn('sandbox_bool');
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.schema.table('farm', (table) => {
      table.boolean('sandbox_bool').notNullable().defaultTo(false);
    }),
  ]);
};
