exports.up = function(knex) {
  return knex.schema.createTable('user_status', (table) => {
    table.integer('status_id').primary();
    table.string('status_description');
  }).then(() => {
    return knex.batchInsert('user_status', [{
      status_id: 1,
      status_description: 'Active',
    }, {
      status_id: 2,
      status_description: 'Invited',
    }, {
      status_id: 3,
      status_description: 'Legacy-Auth0',
    }])
  }).then(() => {
    return knex.schema.alterTable('users', (t) => {
      t.integer('status').references('status_id').inTable('user_status').defaultTo(1)
    })
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_status');
};
