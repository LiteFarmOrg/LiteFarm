export const up = function (knex) {
  return knex.schema.alterTable('barn', (t) => {
    t.boolean('used_for_animals');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('barn', (t) => {
    t.dropColumn('used_for_animals');
  });
};
