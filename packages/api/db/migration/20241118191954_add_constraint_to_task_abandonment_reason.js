/*
 *  Copyright 2024 LiteFarm.org
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
export const up = async (knex) => {
  const reasons = [
    'OTHER',
    'CROP_FAILURE',
    'LABOUR_ISSUE',
    'MARKET_PROBLEM',
    'WEATHER',
    'MACHINERY_ISSUE',
    'SCHEDULING_ISSUE',
    'NO_ANIMALS',
  ];
  await knex.raw(`
    ALTER TABLE task ADD CONSTRAINT abandonment_reason_check 
    CHECK (abandonment_reason = ANY (ARRAY['${reasons.join(`'::text,'`)}'::text]))
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.raw('ALTER TABLE task DROP CONSTRAINT abandonment_reason_check');
};
