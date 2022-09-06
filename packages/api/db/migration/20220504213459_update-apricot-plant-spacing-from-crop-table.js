/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

const tableName = 'crop';
const apricot_id = 31; // Apricot
const apricot_plant_spacing = 4.572; // in m

export const up = async function (knex) {
  await knex(tableName)
    .where({ crop_id: apricot_id })
    .update({ plant_spacing: apricot_plant_spacing });
};

export const down = async function (knex) {
  await knex(tableName).where({ crop_id: apricot_id }).update({ plant_spacing: 15 });
};
