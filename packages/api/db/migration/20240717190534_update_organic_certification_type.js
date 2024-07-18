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
  await knex('certifications')
    .update({
      certification_translation_key: 'THIRD_PARTY_ORGANIC',
      certification_type: 'Third-party Organic',
    })
    .where({ certification_translation_key: 'ORGANIC', certification_type: 'Organic' });
};

export const down = async function (knex) {
  await knex('certifications')
    .update({ certification_translation_key: 'ORGANIC', certification_type: 'Organic' })
    .where({
      certification_translation_key: 'THIRD_PARTY_ORGANIC',
      certification_type: 'Third-party Organic',
    });
};
