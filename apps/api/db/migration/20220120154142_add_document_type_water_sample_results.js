export const up = function (knex) {
  return knex.schema.raw(`
    ALTER TABLE "document"
    DROP CONSTRAINT "document_type_check",
    ADD CONSTRAINT "document_type_check"
    CHECK (type IN (
      'CLEANING_PRODUCT', 'CROP_COMPLIANCE', 'FERTILIZING_PRODUCT',
      'PEST_CONTROL_PRODUCT', 'SOIL_AMENDMENT', 'SOIL_SAMPLE_RESULTS', 'WATER_SAMPLE_RESULTS', 'OTHER'
    ))
  `);
};

export const down = function (knex) {
  return knex.schema.raw(`
    ALTER TABLE "document"
    DROP CONSTRAINT "document_type_check",
    ADD CONSTRAINT "document_type_check"
    CHECK (type IN (
      'CLEANING_PRODUCT', 'CROP_COMPLIANCE', 'FERTILIZING_PRODUCT',
      'PEST_CONTROL_PRODUCT', 'SOIL_AMENDMENT', 'SOIL_SAMPLE_RESULTS', 'OTHER'
    ))
  `);
};
