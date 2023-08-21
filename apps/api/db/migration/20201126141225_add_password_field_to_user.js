export const up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.string('password_hash');
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('password_hash');
    }),
  ]);
};
