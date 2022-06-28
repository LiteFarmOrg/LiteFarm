exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('sensor', function (table) {
      table.uuid('sensor_id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v1()'));
      table.uuid('farm_id').notNullable();
      table.string('name').notNullable();
      table
        .integer('partner_id')
        .references('partner_id')
        .inTable('integrating_partner')
        .notNullable();
      table.string('external_id').notNullable();
      table.uuid('location_id').references('location_id').inTable('location').notNullable();
      table.float('depth');
      table.float('elevation');
    }),

    knex.schema.createTable('sensor_reading', function (table) {
      table.uuid('reading_id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v1()'));
      table.string('sensor_id').notNullable();
      table.timestamp('read_time').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.string('reading_type').notNullable();
      table.float('value').notNullable();
      table.string('unit').notNullable();
      table.boolean('valid').notNullable().defaultTo(true);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([knex.schema.dropTable('sensor'), knex.schema.dropTable('sensor_reading')]);
};
