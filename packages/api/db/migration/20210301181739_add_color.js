const newEnum = ['gate', 'water_valve', 'field', 'buffer_zone', 'creek', 'fence', 'ceremonial_area',
  'residence', 'ground_water', 'natural_area', 'greenhouse', 'barn', 'custom_line', 'custom_point', 'custom_area'];
exports.up = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE figure DROP CONSTRAINT figure_type_check;
              ALTER TABLE figure ADD CONSTRAINT figure_type_check 
              CHECK (type = ANY (ARRAY['${newEnum.join(`'::text,'`)}'::text]))`),
    knex.schema.createTable('custom_location', (t) => {
      t.uuid('location_id').primary().references('location_id').inTable('location')
    }),
    knex.schema.alterTable('figure', (t) => {
      t.string('main_color', 6);
      t.string('hover_color', 6);
      t.string('line_type');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE figure DROP CONSTRAINT figure_type_check;
              ALTER TABLE figure ADD CONSTRAINT figure_type_check  
              CHECK (type = ANY (ARRAY['${newEnum.slice(0, -3).join(`'::text,'`)}'::text]))`),
    knex.schema.dropTable('custom_location'),
    knex.schema.alterTable('figure', (t) => {
      t.dropColumn('main_color');
      t.dropColumn('hover_color');
      t.dropColumn('line_type');
    }),
  ]);
};
