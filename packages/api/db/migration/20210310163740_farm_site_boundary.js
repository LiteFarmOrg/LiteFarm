const newEnum = ['gate', 'water_valve', 'field', 'buffer_zone', 'creek', 'fence', 'ceremonial_area',
  'residence', 'ground_water', 'natural_area', 'greenhouse', 'barn', 'farm_site_boundary'];
exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('farm_site_boundary', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
    }),
    knex.raw(`ALTER TABLE figure DROP CONSTRAINT figure_type_check;
              ALTER TABLE figure ADD CONSTRAINT figure_type_check
              CHECK (type = ANY (ARRAY['${newEnum.join(`'::text,'`)}'::text]))`),
    knex('permissions').insert([
      { permission_id: 113, name: 'add:farm_site_boundary', description: 'Create a farm site boundary' },
      { permission_id: 114, name: 'edit:farm_site_boundary', description: 'update a farm site boundary' },
    ]),
    knex('rolePermissions').insert([
      { role_id: 1, permission_id: 113 },
      { role_id: 2, permission_id: 113 },
      { role_id: 5, permission_id: 113 },
      { role_id: 1, permission_id: 114 },
      { role_id: 2, permission_id: 114 },
      { role_id: 5, permission_id: 114 },
    ]),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable('farm_site_boundary'),
    knex.raw(`ALTER TABLE figure DROP CONSTRAINT figure_type_check;
              ALTER TABLE figure ADD CONSTRAINT figure_type_check
              CHECK (type = ANY (ARRAY['${newEnum.slice(0, -1).join(`'::text,'`)}'::text]))`),
    knex('rolePermissions').whereIn('permission_id', [113, 114]).del(),
    knex('permissions').whereIn('permission_id', [113, 114]).del(),
  ])
};
