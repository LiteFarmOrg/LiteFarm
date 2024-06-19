/*
 *  Copyright (c) 2024 LiteFarm.org
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

export const up = async function (knex) {
  await knex.schema.alterTable('soil_amendment_product', (table) => {
    table.check('moisture_content_percent <= 100', [], 'moisture_percent_check');
  });

  const soilAmendmentPurposes = await knex.select().table('soil_amendment_purpose');
  const otherPurpose = soilAmendmentPurposes.find((pu) => pu.key === 'OTHER');

  await knex('soil_amendment_task_products_purpose_relationship')
    .whereNot({ purpose_id: otherPurpose.id })
    .update({ other_purpose: null });

  await knex.schema.alterTable('soil_amendment_task_products_purpose_relationship', (table) => {
    table.check(
      `(other_purpose IS NOT NULL AND purpose_id = ${otherPurpose.id}) OR (other_purpose IS NULL)`,
      [],
      'other_purpose_id_check',
    );
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('soil_amendment_product', (table) => {
    table.dropChecks(['moisture_percent_check']);
  });

  await knex.schema.alterTable('soil_amendment_task_products_purpose_relationship', (table) => {
    table.dropChecks(['other_purpose_id_check']);
  });
};
