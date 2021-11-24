
exports.up = async function (knex) {
  await knex.schema.createTable('organic_history', (t) => {
    t.increments('id').primary();
    t.uuid('location_id')
      .references('location_id')
      .inTable('location').notNullable();
    t.enu('to_state', ['Non-Organic', 'Transitional', 'Organic']).defaultTo('Non-Organic');
    t.dateTime('effective_date').notNullable();
    t.boolean('deleted').defaultTo(false);
    t.string('created_by_user_id').references('user_id').inTable('users');
    t.string('updated_by_user_id').references('user_id').inTable('users');
    t.dateTime('created_at').notNullable();
    t.dateTime('updated_at').notNullable();
  });

  // TODO populate data
};

exports.down = function (knex) {
  return knex.schema.dropTable('organic_history');
};
