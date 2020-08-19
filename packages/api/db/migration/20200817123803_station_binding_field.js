exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('weather_station', (t) => {
      t.integer('id').primary();
      t.string('name');
      t.string('country');
      t.integer('timezone');
    }),
    knex.schema.alterTable('field', (t) => {
      t.integer('station_id');
      t.foreign('station_id').references('id').inTable('weather_station');
    }),
    knex.schema.alterTable('weatherHourly', (t) => {
      t.dropForeign('field_id');
      t.dropColumn('field_id');
      t.integer('station_id').unsigned().notNullable();
      t.foreign('station_id').references('id').inTable('weather_station');
    }),
    knex.schema.alterTable('weather', (t) => {
      t.dropForeign('field_id');
      t.dropColumn('field_id');
      t.integer('station_id').unsigned().notNullable();
      t.foreign('station_id').references('id').inTable('weather_station');
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('field', (t) => {
      t.dropForeign('station_id');
      t.dropColumn('station_id');
    }),
    knex.schema.alterTable('weather', (t) => {
      t.uuid('field_id').notNullable();
      t.foreign('field_id').references('field_id').inTable('field');
      t.dropForeign('station_id');
      t.dropColumn('station_id');
    }),
    knex.schema.alterTable('weatherHourly', (t) => {
      t.uuid('field_id').notNullable();
      t.foreign('field_id').references('field_id').inTable('field');
      t.dropForeign('station_id');
      t.dropColumn('station_id');
    }),
  ]).then(() => {
    return knex.schema.dropTable('weather_station')
  });
};
