exports.up = function(knex) {

  return Promise.all([
    knex.schema.createTable('garden', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
      t.enu('organic_status', ['Non-Organic', 'Transitional', 'Organic']).defaultTo('Non-Organic');
      t.date('transition_date');
      t.integer('station_id');
      t.foreign('station_id').references('id').inTable('weather_station');
    }),
    knex.schema.alterTable('area', (t) => {
      t.enu('total_area_unit', ['m2', 'ha', 'ft2', 'ac']).defaultTo('m2');
      t.enu('perimeter_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('m');
    }),
    knex.schema.alterTable('creek', (t) => {
      t.enu('buffer_width_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('m');
    }),
    knex.schema.alterTable('line', (t) => {
      t.enu('length_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('m');
      t.enu('width_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('m');
    }),
    knex.schema.raw(`
    ALTER TABLE "figure"
    DROP CONSTRAINT "figure_type_check",
    ADD CONSTRAINT "figure_type_check" 
    CHECK (type IN ('gate', 'water_valve', 'farm_site_boundary', 'field', 'garden', 'buffer_zone', 'creek', 'fence', 'ceremonial_area',
        'residence', 'surface_water', 'natural_area', 'greenhouse', 'barn'))
  `),
    knex.schema.renameTable('ground_water', 'surface_water'),
    knex('permissions').where({ permission_id: 97 }).update({
      name: 'add:surface_water',
      description: 'Create surface water area',
    }),
    knex('permissions').where({ permission_id: 108 }).update({
      name: 'edit:surface_water',
      description: 'Edit a surface water area',
    }),
    knex('permissions').insert([
      { permission_id: 115, name: 'add:garden', description: 'Create a garden' },
      { permission_id: 116, name: 'edit:garden', description: 'Update a garden' },
    ]),
    knex('rolePermissions').insert([
      { role_id: 1, permission_id: 115 },
      { role_id: 2, permission_id: 115 },
      { role_id: 5, permission_id: 115 },
      { role_id: 1, permission_id: 116 },
      { role_id: 2, permission_id: 116 },
      { role_id: 5, permission_id: 116 },
    ]),
  ]);
};

exports.down = function(knex) {
  const permissions = [115, 116];
  return Promise.all([
    knex.schema.dropTable('garden'),
    knex.schema.alterTable('area', (t) => {
      t.dropColumn('total_area_unit');
      t.dropColumn('perimeter_unit');
    }),
    knex.schema.alterTable('creek', (t) => {
      t.dropColumn('buffer_width_unit');
    }),
    knex.schema.alterTable('line', (t) => {
      t.dropColumn('length_unit');
      t.dropColumn('width_unit');
    }),
    knex.schema.raw(`
    ALTER TABLE "figure"
    DROP CONSTRAINT "figure_type_check",
    ADD CONSTRAINT "figure_type_check" 
    CHECK (type IN ('gate', 'water_valve', 'farm_site_boundary', 'field', 'buffer_zone', 'creek', 'fence', 'ceremonial_area',
        'residence', 'ground_water', 'natural_area', 'greenhouse', 'barn'))
  `),
    knex.schema.renameTable('surface_water', 'ground_water'),
    knex('permissions').where({ permission_id: 97 }).update({
      name: 'add:ground_water',
      description: 'Create a ground water area',
    }),
    knex('permissions').where({ permission_id: 108 }).update({
      name: 'edit:ground_water',
      description: 'Edit a ground water area',
    }),
    knex('rolePermissions').whereIn('permission_id', permissions).del(),
    knex('permissions').whereIn('permission_id', permissions).del(),
  ]);
};
