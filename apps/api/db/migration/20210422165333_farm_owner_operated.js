export const up = function (knex) {
  return knex.schema.alterTable('farm', (t) => {
    t.boolean('owner_operated').defaultTo(null);
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('farm', (t) => {
    t.dropColumn('owner_operated');
  });
};
