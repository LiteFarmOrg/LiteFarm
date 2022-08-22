export const up = function (knex) {
  return knex.schema.alterTable('users', (t) => {
    t.string('language_preference', 5).notNullable().defaultTo('en');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('users', (t) => {
    t.dropColumn('language_preference');
  });
};
