
exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('userLog', (table) => {
      table.string('ip').alter();
      table.string('browser').alter();
      table.string('browser_version').alter();
      table.string('os').alter();
      table.string('os_version').alter();
      table.integer('screen_width').alter();
      table.integer('screen_height').alter();
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('userLog', (table) => {
      table.string('ip').notNullable().alter();
      table.string('browser').notNullable().alter();
      table.string('browser_version').notNullable().alter();
      table.string('os').notNullable().alter();
      table.string('os_version').notNullable().alter();
      table.integer('screen_width').notNullable().alter();
      table.integer('screen_height').notNullable().alter();
    }),
  ])
};
