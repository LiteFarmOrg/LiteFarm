
exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('userLog', function (table) {
      table.uuid('user_log_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('user_id').references('user_id').inTable('users');
      table.string('ip').notNullable();
      table.jsonb('languages').defaultTo(JSON.stringify([]));
      table.string('browser').notNullable();
      table.string('browser_version').notNullable();
      table.string('os').notNullable();
      table.string('os_version').notNullable();
      table.string('device_vendor');
      table.string('device_model');
      table.string('device_type');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.integer('screen_width').notNullable();
      table.integer('screen_height').notNullable();
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('userLog')]);
};
