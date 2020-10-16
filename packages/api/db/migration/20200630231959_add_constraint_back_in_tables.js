/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20200630231959_add_constraint_back_in_tables.js) is part of LiteFarm.
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

exports.up = async function(knex) {
  await knex.raw(
    `
    ALTER TABLE "activityLog"
    ADD CONSTRAINT user_id foreign key(user_id) references users(user_id) ON UPDATE CASCADE
    `
  );

  await knex.raw(
    `
    ALTER TABLE "shift"
    ADD CONSTRAINT user_id foreign key(user_id) references users(user_id) ON UPDATE CASCADE
    `
  );

  await knex.raw(
    `
    ALTER TABLE "farmDataSchedule"
    ADD CONSTRAINT user_id foreign key(user_id) references users(user_id) ON UPDATE CASCADE
    `
  );

  await knex.raw(
    `
    ALTER TABLE "userFarm"
    ADD CONSTRAINT user_id foreign key(user_id) references users(user_id) ON UPDATE CASCADE
    `
  );

};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('shift', (table) => {
      table.dropForeign('user_id', 'user_id')
    }),
    knex.schema.table('userFarm', (table) => {
      table.dropForeign('user_id', 'user_id')
    }),
    knex.schema.table('farmDataSchedule', (table) => {
      table.dropForeign('user_id', 'user_id')
    }),
    knex.schema.table('activityLog', (table) => {
      table.dropForeign('user_id', 'user_id')
    }),
  ])
};
