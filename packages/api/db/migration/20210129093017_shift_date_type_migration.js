exports.up = function(knex) {
  return knex.schema.alterTable('shift', t => {
    t.dateTime('shift_date').notNullable().defaultTo(knex.fn.now()).alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('shift', t => {
    t.date('shift_date').notNullable().defaultTo(knex.fn.now()).alter();
  });
};
