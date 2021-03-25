exports.up = function(knex) {
  return Promise.all([
    knex.schema.raw(`
    ALTER TABLE "water_valve"
    DROP CONSTRAINT "water_valve_flow_rate_unit_check",
    ADD CONSTRAINT "water_valve_flow_rate_unit_check" 
    CHECK (flow_rate_unit IN ('l/min', 'l/h', 'gal/min', 'gal/h'));
    ALTER TABLE "water_valve"
    ALTER "flow_rate_unit" SET DEFAULT 'l/h';
  `),
  ]);

};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.raw(`
    ALTER TABLE "water_valve"
    DROP CONSTRAINT "water_valve_flow_rate_unit_check",
    ADD CONSTRAINT "water_valve_flow_rate_unit_check" 
    CHECK (flow_rate_unit IN ('l/min', 'l/hour', 'g/min', 'g/hour'));
    ALTER TABLE "water_valve"
    ALTER "flow_rate_unit" DROP DEFAULT;
  `),
  ]);
};
