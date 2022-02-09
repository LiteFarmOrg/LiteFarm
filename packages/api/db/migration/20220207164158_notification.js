exports.up = async function (knex) {
  await knex.schema.createTable('notification', function (table) {
    table.uuid('notification_id').primary();
    table.string('title').notNullable();
    table.string('body').notNullable();
    table.enum('ref_type', ['task', 'location', 'users', 'farm', 'document', 'export',
      // 'observation', 'weather', 'sensor', 'irrigation', 'insight',
    ]);
    table.string('ref');
    table.jsonb('scope');
    table.uuid('farm_id').references('farm_id').inTable('farm').onDelete('CASCADE');
    table.boolean('deleted').defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable();
    table.dateTime('updated_at').notNullable();
  });

  await knex.schema.createTable('notification_user', function (table) {
    table.primary(['notification_id', 'user_id']);
    table.uuid('notification_id').references('notification_id').inTable('notification');
    table.string('user_id').references('user_id').inTable('users');
    table.boolean('alert').defaultTo(true).notNullable();
    table.enum('status', ['Unread', 'Read', 'Archived']).defaultTo('Unread').notNullable();
    table.boolean('deleted').defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable();
    table.dateTime('updated_at').notNullable();
  });
}

exports.down = async function (knex) {
  await knex.schema.dropTable('notification_user');
  await knex.schema.dropTable('notification');
}
