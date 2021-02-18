exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('users', function(table) {
      table.enu('gender',
        ['OTHER', 'PREFER_NOT_TO_SAY', 'MALE', 'FEMALE']).notNullable().defaultTo('PREFER_NOT_TO_SAY');
      table.integer('birth_year');
    }),
  ]);
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumns('gender', 'birth_year');
  });
};
