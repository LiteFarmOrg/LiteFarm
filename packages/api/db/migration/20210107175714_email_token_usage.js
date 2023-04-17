export const up = function (knex) {
  return Promise.all([
    knex.schema.alterTable('emailToken', (table) => {
      table.dropColumn('is_used');
      table.integer('times_sent');
      table.text('token').alter();
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.schema.alterTable('emailToken', (table) => {
      table.boolean('is_used').defaultTo(false);
      table.dropColumn('times_sent');
    }),
  ]);
};
