exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('sensor', function (table) {
      table.uuid('sensor_id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v1()'));
      table.string('farm_id').notNullable();
      table.string('name').notNullable();
      table.jsonb('grid_points').notNullable();
      table.float('depth');
      table.float('elevation');
      table.integer('partner_id');
      table.string('external_id');
    }),

    knex.schema.createTable('sensor_reading', function (table) {
      table.uuid('reading_id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v1()'));
      table.timestamp('read_time').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.uuid('sensor_id').references('sensor_id').inTable('sensor').notNullable();
      table.string('reading_type').notNullable();
      table.float('value').notNullable();
      table.string('unit').notNullable();
      table.boolean('valid').notNullable().defaultTo(true);
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
