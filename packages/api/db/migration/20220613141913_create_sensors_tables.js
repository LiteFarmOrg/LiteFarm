exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('sensors', function (table) {
      table.integer('sensor_id').primary().notNullable();
      table.string('farm_id').notNullable();
      table.string('name').notNullable();
      table.float('latitude').notNullable();
      table.float('longitude').notNullable();
      table.integer('type').notNullable();
      table.string('external_id');
      table.float('depth');
      table.float('elevation');
    }),

    knex.schema.createTable('sensor_readings', function (table) {
      table.integer('reading_id').primary().notNullable();
      table.timestamp('read_time').defaultTo(knex.fn.now());
      table.timestamp('transmit_time').notNullable();
      table.integer('sensor_id').notNullable();
      table.string('reading_type').notNullable();
      table.float('value').notNullable();
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable('sensors'),
    //   knex.schema.dropTable('sensor_parameter'),
    knex.schema.dropTable('sensor_readings'),
  ]);
};
