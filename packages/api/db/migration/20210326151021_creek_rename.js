const newEnum = ['gate', 'water_valve', 'field', 'buffer_zone', 'fence', 'ceremonial_area', 'garden',
  'residence', 'ground_water', 'natural_area', 'greenhouse', 'barn', 'farm_site_boundary', 'surface_water', 'watercourse'];
exports.up = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE creek RENAME TO watercourse'),
    knex('permissions').where({ permission_id: 93, name: 'add:creek' }).update({
      name: 'add:watercourse',
      description: 'Create a watercourse',
    }),
    knex('permissions').where({ permission_id: 104, name: 'edit:creek' }).update({
      name: 'edit:watercourse',
      description: 'Edit a watercourse',
    }),
    knex.raw(`ALTER TABLE figure DROP CONSTRAINT figure_type_check;
              ALTER TABLE figure ADD CONSTRAINT figure_type_check
              CHECK (type = ANY (ARRAY['${newEnum.join(`'::text,'`)}'::text]))`),
  ]);
};

exports.down = function (knex) {
  const oldEnum = ['creek'].concat(newEnum.slice(0, -1))
  return Promise.all([
    knex.raw('ALTER TABLE watercourse RENAME TO creek'),
    knex('permissions').where({ permission_id: 93 }).update({
      name: 'add:creek',
      description: 'Create a creek',
    }),
    knex('permissions').where({ permission_id: 104 }).update({
      name: 'edit:creek',
      description: 'Edit a creek',
    }),
    knex.raw(`ALTER TABLE figure DROP CONSTRAINT figure_type_check;
              ALTER TABLE figure ADD CONSTRAINT figure_type_check
              CHECK (type = ANY (ARRAY['${oldEnum.join(`'::text,'`)}'::text]))`)

  ]);
};
