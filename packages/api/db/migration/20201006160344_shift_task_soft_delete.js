export const up = function (knex) {
  return knex.schema.alterTable('shiftTask', (table) => {
    table.boolean('deleted').defaultTo(false);
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('shiftTask', (table) => {
    table.dropColumn('deleted');
  });
};
