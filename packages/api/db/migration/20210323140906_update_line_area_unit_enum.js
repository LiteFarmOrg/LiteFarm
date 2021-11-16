exports.up = function(knex) {
  return Promise.all([
    knex('area').where({ perimeter_unit: 'in' }).update({ perimeter_unit: 'm' }),
    knex('area').where({ perimeter_unit: 'cm' }).update({ perimeter_unit: 'm' }),
    knex.schema.raw(`
    ALTER TABLE "area"
    DROP CONSTRAINT "area_perimeter_unit_check",
    ADD CONSTRAINT "area_perimeter_unit_check" 
    CHECK (perimeter_unit IN ('m', 'km', 'ft', 'mi'))
  `),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.raw(`
    ALTER TABLE "area"
    DROP CONSTRAINT "area_perimeter_unit_check",
    ADD CONSTRAINT "area_perimeter_unit_check" 
    CHECK (perimeter_unit IN ('cm', 'm', 'km', 'in', 'ft', 'mi'))
  `),
  ]);
};
