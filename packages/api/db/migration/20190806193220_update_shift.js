/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (20190806193220_update_shift.js) is part of LiteFarm.
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

const formatAlterTableEnumSql = (
  tableName,
  columnName,
  enums,
) => {
  const constraintName = `${tableName}_${columnName}_check`;
  return [
    `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`,
    `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${columnName} = ANY (ARRAY['${enums.join(
      "'::text, '" // eslint-disable-line
    )}'::text]));`,
  ].join('\n');
};

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('shift', (table) => {
      table.float('wage').defaultTo(0);
    }),
    knex.raw(
      formatAlterTableEnumSql('shift', 'mood', ['happy', 'neutral', 'very happy', 'sad', 'very sad', 'na'])
    ),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('shift', (table) => {
      table.dropColumn('wage');
    }),
    knex.raw(
      formatAlterTableEnumSql('shift', 'mood', ['happy', 'neutral', 'very happy', 'sad', 'very sad'])
    ),
  ])
};
