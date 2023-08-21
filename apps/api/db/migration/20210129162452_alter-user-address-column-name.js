export const up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.renameColumn('address', 'user_address');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.renameColumn('user_address', 'address');
  });
};
