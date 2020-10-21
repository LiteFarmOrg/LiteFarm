/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20200617100116_add_consent_version_to_user_farm.js) is part of LiteFarm.
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
      knex.schema.table('userFarm', (table) => {
        table.boolean('step_one').nullable().defaultTo(false)
        table.string('step_one_end').nullable().defaultTo(null)
        table.boolean('step_two').nullable().defaultTo(false)
        table.string('step_two_end').nullable().defaultTo(null)
        table.boolean('step_three').nullable().defaultTo(false)
        table.string('step_three_end').nullable().defaultTo(null)
        table.boolean('step_four').nullable().defaultTo(false)
        table.string('step_four_end').nullable().defaultTo(null)

      }),
    ])
  };
  
  exports.down = function(knex) {
    return Promise.all([
      knex.schema.table('userFarm', (table) => {
        table.dropColumn('step_one');
        table.dropColumn('step_one_end');
        table.dropColumn('step_two');
        table.dropColumn('step_two_end');
        table.dropColumn('step_three');
        table.dropColumn('step_three_end');
        table.dropColumn('step_four');
        table.dropColumn('step_four_end');
      }),
    ])
  };
  
  
