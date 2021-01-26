/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20200623235501_add_permissions_values.js) is part of LiteFarm.
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

exports.up = function(knex) {
    return Promise.all([
        knex('harvestUseType').insert([
            { harvest_use_type_name: 'Sales'},
            { harvest_use_type_name: 'Self-Consumption'},
            { harvest_use_type_name: 'Animal Feed'},
            { harvest_use_type_name: 'Compost'},
            { harvest_use_type_name: 'Gift'},
            { harvest_use_type_name: 'Exchange'},
            { harvest_use_type_name: 'Saved for seed'},
            { harvest_use_type_name: 'Not Sure'},
            { harvest_use_type_name: 'Other'},
        ]),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
      knex('harvestUseType').del(),
    ]);
  };
