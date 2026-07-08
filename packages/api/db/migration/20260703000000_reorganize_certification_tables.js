/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

/**
 * Reorganizes the certification tables to support multiple certifications per farm:
 * - Renames `certifications` → `certification_system_type` with column renames
 * - Renames `organicCertifierSurvey` → `certification` with column renames and new fields
 * - Soft-deletes `interested = false` rows (no previously deleted rows exist, so `down` can safely reverse this)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // Step 1: Soft-delete interested=false rows before schema changes.
  await knex('organicCertifierSurvey').where({ interested: false }).update({ deleted: true });

  // Step 2: Rename certifications → certification_system_type and rename all columns
  await knex.schema.renameTable('certifications', 'certification_system_type');
  await knex.schema.alterTable('certification_system_type', (table) => {
    table.renameColumn('certification_id', 'id');
    table.renameColumn('certification_type', 'name');
    table.renameColumn('certification_translation_key', 'translation_key');
  });

  // Recreate certifiers FK referencing the new table and column names
  await knex.schema.alterTable('certifiers', (table) => {
    table.dropForeign('certification_id');
    table.renameColumn('certification_id', 'system_type_id');
    table.foreign('system_type_id').references('id').inTable('certification_system_type');
  });

  // Step 3: Rename organicCertifierSurvey → certification with column renames and new columns
  // Drop constraints
  await knex.raw(
    `ALTER TABLE "organicCertifierSurvey" DROP CONSTRAINT IF EXISTS "organiccertifiersurvey_certification_id_foreign"`,
  );
  await knex.raw(
    `ALTER TABLE "organicCertifierSurvey" DROP CONSTRAINT IF EXISTS "organiccertifiersurvey_farm_id_unique"`,
  );

  await knex.schema.renameTable('organicCertifierSurvey', 'certification');
  await knex.schema.alterTable('certification', (table) => {
    table.renameColumn('survey_id', 'id');
    table.renameColumn('certification_id', 'system_type_id');
    table.renameColumn('requested_certification', 'requested_system_type');

    table.boolean('is_active').notNullable().defaultTo(false);
    table
      .enu('certification_type', [
        'ORGANIC',
        'BIODYNAMIC',
        'REGENERATIVE',
        'CERTIFIED_HUMANE',
        'FAIR_TRADE',
        'GRASSFED/PASTURE',
        'SUSTAINABILITY',
        'ANIMAL_WELFARE',
        'NON-GMO',
        'CARBON/CLIMATE',
      ])
      .nullable();
    table.string('certificate_number').nullable();
    table.string('certificate_member_id').nullable();
    table.date('issue_date').nullable();
    table.date('valid_until').nullable();
    table.text('certificate_document_url').nullable();

    table.dropColumn('interested');
  });

  // Add FK for system_type_id after columns are in place
  await knex.schema.alterTable('certification', (table) => {
    table.foreign('system_type_id').references('id').inTable('certification_system_type');
  });

  // Step 4: Rename permissions
  await knex('permissions')
    .where({ name: 'get:organic_certifier_survey' })
    .update({ name: 'get:certification', description: 'get certification' });
  await knex('permissions')
    .where({ name: 'add:organic_certifier_survey' })
    .update({ name: 'add:certification', description: 'add certification' });
  await knex('permissions')
    .where({ name: 'edit:organic_certifier_survey' })
    .update({ name: 'edit:certification', description: 'edit certification' });
  await knex('permissions')
    .where({ name: 'delete:organic_certifier_survey' })
    .update({ name: 'delete:certification', description: 'delete certification' });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  // Restore permissions
  await knex('permissions')
    .where({ name: 'get:certification' })
    .update({ name: 'get:organic_certifier_survey', description: 'get organic_certifier_survey' });
  await knex('permissions')
    .where({ name: 'add:certification' })
    .update({ name: 'add:organic_certifier_survey', description: 'add organic_certifier_survey' });
  await knex('permissions').where({ name: 'edit:certification' }).update({
    name: 'edit:organic_certifier_survey',
    description: 'edit organic_certifier_survey',
  });
  await knex('permissions').where({ name: 'delete:certification' }).update({
    name: 'delete:organic_certifier_survey',
    description: 'delete organic_certifier_survey',
  });

  // Drop system_type_id FK before renaming columns and table
  await knex.schema.alterTable('certification', (table) => {
    table.dropForeign('system_type_id');
  });

  await knex.schema.renameTable('certification', 'organicCertifierSurvey');

  await knex.schema.alterTable('organicCertifierSurvey', (table) => {
    table.dropColumn('certificate_document_url');
    table.dropColumn('valid_until');
    table.dropColumn('issue_date');
    table.dropColumn('certificate_member_id');
    table.dropColumn('certificate_number');
    table.dropColumn('certification_type');
    table.dropColumn('is_active');

    table.boolean('interested').notNullable().defaultTo(false);
    table.unique('farm_id');

    table.renameColumn('requested_system_type', 'requested_certification');
    table.renameColumn('system_type_id', 'certification_id');
    table.renameColumn('id', 'survey_id');
  });

  // Drop certifiers FK and rename column before renaming certification_system_type back
  await knex.schema.alterTable('certifiers', (table) => {
    table.dropForeign('system_type_id');
    table.renameColumn('system_type_id', 'certification_id');
  });

  await knex.schema.alterTable('certification_system_type', (table) => {
    table.renameColumn('translation_key', 'certification_translation_key');
    table.renameColumn('name', 'certification_type');
    table.renameColumn('id', 'certification_id');
  });
  await knex.schema.renameTable('certification_system_type', 'certifications');

  // Recreate certifiers FK referencing the restored table/column names
  await knex.schema.alterTable('certifiers', (table) => {
    table.foreign('certification_id').references('certification_id').inTable('certifications');
  });

  // Restore soft-deleted rows: all deleted=true rows were soft-deleted in up() (no prior deletes existed).
  // The interested column was re-added with defaultTo(false), so non-deleted rows need interested=true restored.
  await knex('organicCertifierSurvey').where({ deleted: false }).update({ interested: true });
  await knex('organicCertifierSurvey').where({ deleted: true }).update({ deleted: false });
};
