/*
 *  Copyright (c) 2023 LiteFarm.org
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
  await knex('revenue_type').where({ revenue_type_id: 1 }).delete();
  await knex('revenue_type').insert({
    revenue_name: 'Crop Sale',
    farm_id: null,
    deleted: false,
    created_by_user_id: '1',
    updated_by_user_id: '1',
    created_at: new Date('2000/1/1').toISOString(),
    updated_at: new Date('2000/1/1').toISOString(),
    revenue_translation_key: 'CROP_SALE',
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex('revenue_type').insert({
    revenue_type_id: 1,
    revenue_name: 'Crop Sale',
    farm_id: null,
    deleted: false,
    created_by_user_id: '1',
    updated_by_user_id: '1',
    created_at: new Date('2000/1/1').toISOString(),
    updated_at: new Date('2000/1/1').toISOString(),
    revenue_translation_key: 'CROP_SALE',
  });
};
