/*
 *  Copyright 2025 LiteFarm.org
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
  await knex.schema.createTable('farm_market_directory_partner', (table) => {
    table.uuid('farm_id').references('farm_id').inTable('farm');
    table
      .integer('market_directory_partner_id')
      .references('id')
      .inTable('market_directory_partner');
    table.boolean('deleted').notNullable().defaultTo(false);
    table
      .string('created_by_user_id')
      .references('user_id')
      .inTable('users')
      .notNullable()
      .defaultTo(1);
    table
      .string('updated_by_user_id')
      .references('user_id')
      .inTable('users')
      .notNullable()
      .defaultTo(1);
    table.dateTime('created_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
    table.dateTime('updated_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());

    table.primary(['farm_id', 'market_directory_partner_id']);
  });

  await knex('permissions').insert([
    {
      permission_id: 185,
      name: 'edit:farm_market_directory_partners',
      description: 'edit farm market directory partners',
    },
    {
      permission_id: 186,
      name: 'get:farm_market_directory_partners',
      description: 'get farm market directory partners',
    },
  ]);

  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 185 },
    { role_id: 2, permission_id: 185 },
    { role_id: 5, permission_id: 185 },
    { role_id: 1, permission_id: 186 },
    { role_id: 2, permission_id: 186 },
    { role_id: 5, permission_id: 186 },
  ]);

  // Store the consent checkbox state
  await knex.schema.alterTable('market_directory_info', (table) => {
    table.boolean('consented_to_share').notNullable().defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.alterTable('market_directory_info', (table) => {
    table.dropColumn('consented_to_share');
  });

  const permissions = [185, 186];

  await knex('rolePermissions').whereIn('permission_id', permissions).del();
  await knex('permissions').whereIn('permission_id', permissions).del();

  await knex.schema.dropTable('farm_market_directory_partner');
};
