// eslint-disable-next-line no-unused-vars
export const up = function (knex, Promise) {
  return knex.schema.createTable('currency_table', function (table) {
    table.increments();
    table.string('country_name').notNullable();
    table.string('currency').notNullable();
    table.string('symbol').notNullable();
    table.string('iso').notNullable();
    table.string('unit').notNullable();
  });
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex, Promise) {
  return knex.schema.dropTable('currency_table');
};
