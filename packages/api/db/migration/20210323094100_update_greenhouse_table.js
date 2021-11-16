/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20180827135325_addFieldName.js) is part of LiteFarm.
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
      knex.schema.table('greenhouse', (table) => {
        table.dateTime('transition_date');
        table.boolean('supplemental_lighting');
        table.boolean('co2_enrichment');
        table.boolean('greenhouse_heated');
      }),
    ])
  };
  
  exports.down = function(knex) {
    return Promise.all([
      knex.schema.table('greenhouse', (table) => {
        table.dropColumn('transition_date');
        table.dropColumn('supplemental_lighting');
        table.dropColumn('co2_enrichment');
        table.dropColumn('greenhouse_heated');
      }),
    ]);
  };
  