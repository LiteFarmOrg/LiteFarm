export const up = function (knex) {
  return knex.schema.raw(`
        ALTER TABLE planting_management_plan
        DROP CONSTRAINT planting_management_plan_estimated_seeds_unit_check,
        ADD CONSTRAINT planting_management_plan_estimated_seeds_unit_check
        CHECK (estimated_seeds_unit = ANY (ARRAY['g'::text, 'kg'::text, 'mt'::text, 'oz'::text, 'lb'::text, 't'::text]));
    `);
};

export const down = function (knex) {
  return knex.schema.raw(`
        UPDATE planting_management_plan SET estimated_seeds_unit = 'lb' WHERE estimated_seeds_unit = 't';
        UPDATE planting_management_plan SET estimated_seeds_unit = 'kg' WHERE estimated_seeds_unit = 'mt';
        ALTER TABLE planting_management_plan
        DROP CONSTRAINT planting_management_plan_estimated_seeds_unit_check,
        ADD CONSTRAINT planting_management_plan_estimated_seeds_unit_check
        CHECK (estimated_seeds_unit = ANY (ARRAY['g'::text, 'kg'::text, 'oz'::text, 'lb'::text]));
    `);
};
