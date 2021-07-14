
exports.up = function(knex) {
  return knex.raw(`
  ALTER TABLE figure
  MODIFY COLUMN
    type enum(
    field,
    farm_site_boundary,
    greenhouse,
    buffer_zone,
    gate,
    surface_water,
    fence,
    garden,
    residence,
    water_valve,
    watercourse,
    barn,
    natural_area,
    ceremonial_area,
    pin
    )
  `)
};

exports.down = async function(knex) {
  await knex.schema.dropColumn('type');
};
