exports.up = async function (knex) {
  await deleteSensorData(knex);

  await knex.raw(`
        DROP TABLE sensor_reading;
        DROP TABLE sensor_reading_type;
        DROP TABLE sensor;
    `);

  await knex.schema.createTable('sensor', function (table) {
    table
      .uuid('location_id')
      .primary()
      .notNullable()
      .references('location_id')
      .inTable('location')
      .onDelete('CASCADE');
    table.uuid('farm_id').notNullable();
    table.string('name').notNullable();
    table
      .integer('partner_id')
      .references('partner_id')
      .inTable('integrating_partner')
      .notNullable();
    table.string('external_id').notNullable();
    table.float('depth');
    table.float('elevation');
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
  await deleteSensorData(knex);
};

async function deleteSensorData(knex) {
  const sensorLocationIdObjs = await knex('sensor').select('location_id');
  const sensorLocationIds = sensorLocationIdObjs.map((s) => s.location_id);

  if (sensorLocationIds.length > 0) {
    await knex.raw(`
              BEGIN TRANSACTION;
              DELETE FROM point p WHERE p.figure_id IN
              (SELECT f.figure_id FROM figure f WHERE f.type = 'sensor');
              DELETE FROM figure f WHERE f.type = 'sensor';
              DELETE FROM sensor_reading;
              DELETE FROM sensor_reading_type;
              DELETE FROM sensor;
              COMMIT;
          `);

    await knex('location').whereIn('location_id', sensorLocationIds).del();
  }
}
