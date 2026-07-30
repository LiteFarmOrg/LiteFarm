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

const THIRD_PARTY_ORGANIC_KEY = 'THIRD_PARTY_ORGANIC';
const PGS_KEY = 'PGS';

const OLD_FVOPA_NAME = 'Fraser Valley Organic Producers';
const NEW_FVOPA_NAME = 'Fraser Valley Organic Producers Association';

// TAPE's `certifiers` row exists only on beta and production.
const TAPE_CERTIFIER_NAME = 'Tool for Agroecology Performance Evaluation';

const MIGRATION_NAME = 'expand_certifier_list';

// `certifier_acronym` is null where the certifier has no acronym in genuine public
// use, and where an acronym would exactly duplicate `certifier_name` — the
// certification card renders `${acronym} — ${name}`, which would read "SGS — SGS".
const thirdPartyOrganicCertifiers = [
  { certifier_name: 'CCOF Certification Services', certifier_acronym: 'CCOF' },
  { certifier_name: 'Oregon Tilth', certifier_acronym: 'OTCO' },
  { certifier_name: 'Quality Assurance International', certifier_acronym: 'QAI' },
  { certifier_name: 'OCIA International', certifier_acronym: 'OCIA' },
  { certifier_name: 'SCS Global Services', certifier_acronym: 'SCS' },
  { certifier_name: 'Midwest Organic Services Association', certifier_acronym: 'MOSA' },
  { certifier_name: 'OEFFA Certification', certifier_acronym: 'OEFFA' },
  { certifier_name: 'Baystate Organic Certifiers', certifier_acronym: null },
  { certifier_name: 'MOFGA Certification Services', certifier_acronym: 'MOFGA' },
  { certifier_name: 'Global Organic Alliance', certifier_acronym: 'GOA' },
  { certifier_name: 'Pro-Cert Organic Systems', certifier_acronym: null },
  { certifier_name: 'Ecocert Canada', certifier_acronym: null },
  { certifier_name: 'Ecocert', certifier_acronym: null },
  { certifier_name: 'Control Union', certifier_acronym: 'CU' },
  { certifier_name: 'Kiwa BCS Öko-Garantie', certifier_acronym: 'BCS' },
  { certifier_name: 'SGS', certifier_acronym: null },
  { certifier_name: 'Bureau Veritas', certifier_acronym: 'BV' },
  { certifier_name: 'Soil Association Certification', certifier_acronym: 'SA Cert' },
  { certifier_name: 'ABCERT', certifier_acronym: null },
  {
    certifier_name: 'Istituto per la Certificazione Etica ed Ambientale',
    certifier_acronym: 'ICEA',
  },
  { certifier_name: 'OneCert', certifier_acronym: null },
  { certifier_name: 'INDOCERT', certifier_acronym: null },
  { certifier_name: 'Ecocert India', certifier_acronym: null },
  { certifier_name: 'ACO Certification', certifier_acronym: 'ACO' },
  { certifier_name: 'AUS-QUAL', certifier_acronym: null },
  { certifier_name: 'Organic Food Chain', certifier_acronym: 'OFC' },
  { certifier_name: 'Demeter', certifier_acronym: null },
];

// `PGS Organic India Council` (an NGO standards body) and `PGS-India` (the government
// programme run through the National Centre of Organic Farming) are two distinct
// systems, both called PGS.
const pgsGroups = [
  { certifier_name: 'Certified Naturally Grown', certifier_acronym: 'CNG' },
  { certifier_name: 'Nature & Progrès', certifier_acronym: 'N&P' },
  { certifier_name: 'PGS Organic India Council', certifier_acronym: 'PGSOC' },
  { certifier_name: 'PGS-India', certifier_acronym: null },
  { certifier_name: 'Bryanston Market PGS', certifier_acronym: null },
  { certifier_name: 'PGS South Africa', certifier_acronym: 'PGS SA' },
  { certifier_name: 'Organic Farm New Zealand', certifier_acronym: 'OFNZ' },
];

const insertedNames = [...thirdPartyOrganicCertifiers, ...pgsGroups].map(
  ({ certifier_name }) => certifier_name,
);

/**
 * @param { import("knex").Knex } knex
 */
const getSystemTypeIds = async function (knex) {
  const systemTypes = await knex('certification_system_type').select('id', 'translation_key');
  const idByKey = Object.fromEntries(
    systemTypes.map(({ id, translation_key }) => [translation_key, id]),
  );

  for (const key of [THIRD_PARTY_ORGANIC_KEY, PGS_KEY]) {
    if (!idByKey[key]) {
      throw new Error(`certification_system_type is missing the ${key} row`);
    }
  }

  return idByKey;
};

/**
 * Removes TAPE, keeping its name as free text on the certifications that referenced it. Its rows
 * are logged because `certifier_id` differs between beta and production and `down` needs the
 * original.
 * @param { import("knex").Knex } knex
 */
const removeTapeCertifier = async function (knex) {
  const tape = await knex('certifiers').where({ certifier_name: TAPE_CERTIFIER_NAME }).first();

  if (!tape) {
    return;
  }

  await knex('certification')
    .where({ certifier_id: tape.certifier_id })
    .update({ certifier_id: null, other_certifier: TAPE_CERTIFIER_NAME });

  const tapeCountries = await knex('certifier_country').where({ certifier_id: tape.certifier_id });

  await knex('certifier_country').where({ certifier_id: tape.certifier_id }).delete();
  await knex('certifiers').where({ certifier_id: tape.certifier_id }).delete();

  await knex('migration_deletion_logs').insert([
    ...tapeCountries.map((row) => ({
      migration_name: MIGRATION_NAME,
      table_name: 'certifier_country',
      data: row,
    })),
    { migration_name: MIGRATION_NAME, table_name: 'certifiers', data: tape },
  ]);
};

/**
 * Restores whatever `removeTapeCertifier` logged and repoints the certifications back.
 * @param { import("knex").Knex } knex
 */
const restoreTapeCertifier = async function (knex) {
  const loggedRows = await knex('migration_deletion_logs')
    .where({ migration_name: MIGRATION_NAME })
    .orderBy('id', 'desc');

  for (const { table_name, data } of loggedRows) {
    try {
      await knex(table_name).insert(data);
    } catch (err) {
      console.error(`Failed to restore row in ${table_name}:`, err);
      throw err;
    }
  }

  await knex('migration_deletion_logs').where({ migration_name: MIGRATION_NAME }).delete();

  const tape = await knex('certifiers').where({ certifier_name: TAPE_CERTIFIER_NAME }).first();

  if (tape) {
    await knex('certification')
      .where({ other_certifier: TAPE_CERTIFIER_NAME })
      .update({ certifier_id: tape.certifier_id, other_certifier: null });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.alterTable('certifiers', (table) => {
    table.string('certifier_acronym').nullable().alter();
  });

  await knex('certifiers')
    .where({ certifier_name: OLD_FVOPA_NAME })
    .update({ certifier_name: NEW_FVOPA_NAME });

  await removeTapeCertifier(knex);

  // `20210621152008_certifier_list_update.js` inserted certifier_id 19 explicitly, which leaves
  // the sequence at 18 on any database built from migrations alone. Beta and production were
  // realigned by hand, where this is a no-op.
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence('certifiers', 'certifier_id'),
                   (SELECT max(certifier_id) FROM certifiers))`,
  );

  const idByKey = await getSystemTypeIds(knex);

  await knex.batchInsert('certifiers', [
    ...thirdPartyOrganicCertifiers.map((certifier) => ({
      ...certifier,
      system_type_id: idByKey[THIRD_PARTY_ORGANIC_KEY],
    })),
    ...pgsGroups.map((certifier) => ({
      ...certifier,
      system_type_id: idByKey[PGS_KEY],
    })),
  ]);
};

export const down = async function (knex) {
  await knex('certifiers').whereIn('certifier_name', insertedNames).delete();

  await knex('certifiers')
    .where({ certifier_name: NEW_FVOPA_NAME })
    .update({ certifier_name: OLD_FVOPA_NAME });

  await restoreTapeCertifier(knex);

  await knex.schema.alterTable('certifiers', (table) => {
    table.string('certifier_acronym').notNullable().alter();
  });
};
