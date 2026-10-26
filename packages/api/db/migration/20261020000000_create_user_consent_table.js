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
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('user_consent', (table) => {
    table.string('user_id').primary().references('user_id').inTable('users').onDelete('CASCADE');
    table.string('consent_version').notNullable();
    table.dateTime('consented_at');
  });

  // Consent was stored per userFarm row. A user counts as consented if any of their rows has
  // consent, at the highest version among them. Versions are compared numerically ('7.1' < '8');
  // values that aren't dot-separated numbers are skipped, so those users are asked again.
  // userFarm has no reliable consent timestamp, so consented_at stays null for these rows.
  await knex.raw(`
    INSERT INTO user_consent (user_id, consent_version)
    SELECT DISTINCT ON (user_id) user_id, consent_version
    FROM "userFarm"
    WHERE has_consent = true
      AND consent_version ~ '^[0-9]+(\\.[0-9]+)*$'
    ORDER BY user_id, string_to_array(consent_version, '.')::int[] DESC
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable('user_consent');
};
