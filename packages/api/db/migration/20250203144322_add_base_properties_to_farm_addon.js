/*
 *  Copyright (c) 2025 LiteFarm.org
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
  await knex.schema.alterTable('farm_addon', (t) => {
    // Knex apparently does not rename indexes aliong with table names
    t.dropPrimary('farm_external_integration_pkey');
  });
  await knex.schema.alterTable('farm_addon', (t) => {
    t.increments('id').primary();
    t.boolean('deleted').notNullable().defaultTo(false);
    t.string('created_by_user_id').references('user_id').inTable('users');
    t.string('updated_by_user_id').references('user_id').inTable('users');
    t.dateTime('created_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
    t.dateTime('updated_at').notNullable().defaultTo(new Date('2000/1/1').toISOString());
  });

  // Add the partial unique index using raw SQL
  // Knex partial indexes not working correctly
  // TODO: Delete this index when multiple organizations are allowed per partner id
  await knex.raw(`
    CREATE UNIQUE INDEX farm_addon_uniqueness_composite
    ON farm_addon(farm_id, addon_partner_id)
    WHERE deleted = false;
  `);
};

export const down = async function (knex) {
  await knex.schema.alterTable('farm_addon', (t) => {
    t.dropIndex(['farm_id', 'addon_partner_id'], 'farm_addon_uniqueness_composite');
    t.dropPrimary();
  });
  await knex.schema.alterTable('farm_addon', (t) => {
    t.primary(['farm_id', 'addon_partner_id'], {
      constraintName: 'farm_external_integration_pkey',
    });
    t.dropColumns([
      'id',
      'deleted',
      'created_by_user_id',
      'updated_by_user_id',
      'created_at',
      'updated_at',
    ]);
  });
};
