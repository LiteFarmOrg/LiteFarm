export const up = function (knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.string('name');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.dropColumn('name');
  });
};
