exports.up = function(knex) {
  return knex.schema.alterTable('users', (t) => {
    t.string('language_preference', 5).notNullable().defaultTo('en')
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', (t) => {
    t.dropColumn('language_preference');
  })
};
