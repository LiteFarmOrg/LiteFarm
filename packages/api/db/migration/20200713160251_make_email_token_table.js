
exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('emailToken', (table) => {
      table.string('user_id')
        .references('user_id')
        .inTable('users').onDelete('CASCADE').onUpdate('CASCADE').notNullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').onDelete('CASCADE').onUpdate('CASCADE').notNullable();
      table.string('token').notNullable();
      table.boolean('is_used').defaultTo(false).notNullable();
      table.timestamps(false, true);
      table.primary(['user_id', 'farm_id']);
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('emailToken'),
  ])

};
