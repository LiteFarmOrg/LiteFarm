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
  await knex.schema.createTable('password', function (table) {
    table.string('user_id').primary().references('user_id').inTable('users');
    table.string('password_hash').notNullable();
    // table.integer('id_token_version');
    table.integer('reset_token_version').defaultTo(0).notNullable();
    table.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
  });
  
  const users = await knex.select('user_id', 'password_hash').from('users');
  for (const user of users) {
    if (user.password_hash)
      await knex('password').insert({
        user_id: user.user_id,
        password_hash: user.password_hash,
      });
  }

  await knex.schema.alterTable('users', function (table) {
    table.dropColumn('password_hash')
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('users', function (table) {
    table.string('password_hash');
  });

  const passwords = await knex.select('user_id', 'password_hash').from('password');
  for (const password of passwords) {
    await knex('users').where('user_id', password.user_id).update({
      password_hash: password.password_hash
    });
  }

  await knex.schema.dropTable('password');
};
