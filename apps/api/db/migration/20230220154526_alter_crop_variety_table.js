/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
  await knex.schema.alterTable('crop_variety', (t) => {
    t.string('crop_varietal').nullable();
    t.string('crop_cultivar').nullable();
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('crop_variety', (t) => {
    t.dropColumn('crop_varietal');
    t.dropColumn('crop_cultivar');
  });
};
