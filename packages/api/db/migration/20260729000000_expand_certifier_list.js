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
 * Resolves system type ids by translation key rather than assuming literal ids, which
 * is how the webapp identifies them too (see `CertificationForm.tsx`).
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

  // `20210621152008_certifier_list_update.js` inserted certifier_id 19 explicitly, and
  // Postgres does not advance a serial's sequence when the value is supplied, so the
  // sequence trails the table's max id and the next insert would collide on the primary
  // key. Realigning is a no-op where the sequence is already correct.
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence('certifiers', 'certifier_id'),
                   (SELECT max(certifier_id) FROM certifiers))`,
  );

  const idByKey = await getSystemTypeIds(knex);

  // `survey_id` is left at its null default: none of these certifiers has a
  // certifier-specific export survey, so the export falls back to the generic form.
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

  await knex.schema.alterTable('certifiers', (table) => {
    table.string('certifier_acronym').notNullable().alter();
  });
};
