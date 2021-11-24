exports.up = function(knex) {
  return knex.schema.createTable('hs_code', t => {
    t.bigInteger('hs_code_id').primary().notNullable();
    t.text('description').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('hs_code');
};
