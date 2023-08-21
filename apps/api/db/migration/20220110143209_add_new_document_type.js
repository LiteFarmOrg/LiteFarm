// eslint-disable-next-line no-unused-vars
export const up = function (knex, Promise) {
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

// eslint-disable-next-line no-unused-vars
export const down = function (knex, Promise) {
  return knex.schema.raw(`
    ALTER TABLE "document"
    DROP CONSTRAINT "document_type_check",
    ADD CONSTRAINT "document_type_check"
    CHECK (type IN (
      'CLEANING_PRODUCT', 'CROP_COMPLIANCE', 'FERTILIZING_PRODUCT',
      'PEST_CONTROL_PRODUCT', 'SOIL_AMENDMENT', 'OTHER'
    ))
  `);
};
