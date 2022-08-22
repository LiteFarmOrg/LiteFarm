export const up = function (knex) {
  return Promise.all([
    knex.schema.table('management_plan', (table) => {
      table.string('notes');
    }),
    knex.schema.table('transplant_container', (table) => {
      table.string('notes');
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.schema.alterTable('management_plan', (table) => {
      table.dropColumn('notes');
    }),
    knex.schema.alterTable('transplant_container', (table) => {
      table.dropColumn('notes');
    }),
  ]);
};
