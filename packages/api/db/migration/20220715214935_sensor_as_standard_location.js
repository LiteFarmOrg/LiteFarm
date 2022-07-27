const deleteSensorData = require('../deleteSensorData');

exports.up = async function (knex) {
  await knex.schema.createTable('sensor', function (table) {
    table
      .uuid('location_id')
      .primary()
      .notNullable()
      .references('location_id')
      .inTable('location')
      .unique()
      .onDelete('CASCADE');
    table
      .integer('partner_id')
      .references('partner_id')
      .inTable('integrating_partner')
      .notNullable();
    table.string('external_id').notNullable();
    table.float('depth');
    table.enu('depth_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
    table.float('elevation');
    table.string('model');
  });

  await knex.schema.createTable('sensor_reading', function (table) {
    table.uuid('reading_id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v1()'));
    table
      .uuid('location_id')
      .notNullable()
      .references('location_id')
      .inTable('sensor')
      .onDelete('CASCADE');
    table.timestamp('read_time').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('reading_type').notNullable();
    table.float('value').notNullable();
    table.string('unit').notNullable();
    table.boolean('valid').notNullable().defaultTo(true);
  });

  await knex.schema.createTable('sensor_reading_type', function (table) {
    table
      .uuid('sensor_reading_type_id')
      .primary()
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v1()'));
    table
      .uuid('partner_reading_type_id')
      .references('partner_reading_type_id')
      .inTable('partner_reading_type');
    table.uuid('location_id').references('location_id').inTable('sensor').onDelete('CASCADE');
  });
};

exports.down = async function (knex) {
  deleteSensorData(knex);
};
