export const up = function (knex) {
  return knex.schema.alterTable('farm', (t) => {
    t.boolean('sandbox_farm').defaultTo(false);
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('farm', (t) => {
    t.dropColumn('sandbox_farm');
  });
};
