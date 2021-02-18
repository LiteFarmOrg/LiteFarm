exports.up = function(knex) {
  return Promise.all([
    knex.schema.dropTable('userTodo'),
    knex.schema.dropTable('todo'),
    knex.schema.dropTable('plan'),
    knex.schema.dropTable('cropCommonName'),
    knex.schema.dropTable('notification'),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.createTable('todo', function(table) {
      table.increments('todo_id').primary();
      table.string('todo_text').notNullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm');
      table.boolean('is_done').defaultTo(false);
      table.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.createTable('userTodo', function(table) {
      table.integer('todo_id')
        .references('todo_id')
        .inTable('todo');
      table.string('user_id')
        .references('user_id')
        .inTable('users');
      table.primary(['todo_id', 'user_id']);
    }),
    knex.schema.createTable('cropCommonName', function(table) {
      table.string('crop_name');
      table.bigint('crop_id')
        .references('crop_id')
        .inTable('crop');
    }),
    knex.schema.createTable('plan', function(table) {
      table.uuid('plan_id').primary();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm');
      table.jsonb('plan_config').notNullable();
      table.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.createTable('notification', function(table) {
      table.uuid('notification_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
      table.string('user_id').references('user_id').inTable('users');
      table.enu('notification_kind', ['todo_added', 'alert_weather', 'alert_worker_finish', 'alert_action_after_scouting', 'alert_before_planned_date', 'alert_pest']).notNullable();
      table.boolean('is_read').notNullable().defaultTo(false);
      table.timestamps(false, true);
    }),
  ]);
};
