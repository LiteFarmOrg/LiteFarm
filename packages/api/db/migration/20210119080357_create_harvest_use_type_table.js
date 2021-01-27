/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20180517190849_create_lite_farm_db.js) is part of LiteFarm.
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

exports.up = async function (knex) {
  return Promise.all([

    knex.schema.createTable('harvestUseType', function (table) {
      table.increments('harvest_use_type_id');
      table.string('harvest_use_type_name').notNullable();
    }),
  ])
};

exports.down = function (knex) {
  //remove all the tables
  return Promise.all([
    knex.schema.dropTable('harvestUseType'),
  ])
};