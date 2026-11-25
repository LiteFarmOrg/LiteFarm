/*
 *  Copyright 2026 LiteFarm.org
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
  // ALTER TABLE has to wait until no other connection is using the table; stop waiting after 10s
  await knex.raw("SET LOCAL lock_timeout = '10s'");

  await knex.schema.createTable('farm_crop', (table) => {
    table.increments('id').primary();
    table.uuid('farm_id').notNullable().references('farm_id').inTable('farm');
    table.integer('crop_id').notNullable().references('crop_id').inTable('crop');
    table.enu('lifecycle', ['ANNUAL', 'PERENNIAL']);
    table.boolean('can_be_cover_crop').notNullable().defaultTo(false);
    table.integer('days_to_harvest');
    table.boolean('needs_transplant');
    table.integer('transplant_days');
    table.text('name_override');
    table.text('photo_override');
    table.boolean('archived').notNullable().defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
    table.boolean('deleted').notNullable().defaultTo(false);

    table.index(['farm_id']);
    table.unique(['farm_id', 'crop_id'], {
      indexName: 'farm_crop_farm_crop_live_unique',
      predicate: knex.whereRaw('deleted = false'),
    });
  });

  await knex.schema.alterTable('crop_variety', (table) => {
    table.boolean('represents_crop').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('management_plan', (table) => {
    table.enu('sowing_date_precision', ['DAY', 'MONTH']).notNullable().defaultTo('DAY');
    table.text('approximate_age');
    table.text('seed_supplier');
    table.boolean('organic');
    table.boolean('genetically_engineered');
    table.boolean('searched');
    table.enu('treated', ['YES', 'NO', 'NOT_SURE']);
  });

  await knex.schema.alterTable('planting_management_plan', (table) => {
    table.decimal('share_percent', 5, 2);
    table.boolean('share_set_by_user').notNullable().defaultTo(false);
  });

  await knex.raw(
    'ALTER TABLE planting_management_plan ADD CONSTRAINT planting_management_plan_share_percent_check CHECK (share_percent > 0 AND share_percent <= 100)',
  );

  await knex.schema.alterTable('crop_variety', (table) => {
    table.unique(['farm_id', 'crop_id'], {
      indexName: 'crop_variety_represents_crop_unique',
      predicate: knex.whereRaw('represents_crop = true AND deleted = false'),
    });
  });
};

export const down = async function (knex) {
  await knex.raw("SET LOCAL lock_timeout = '10s'");

  await knex.raw('DROP INDEX crop_variety_represents_crop_unique');

  await knex.raw(
    'ALTER TABLE planting_management_plan DROP CONSTRAINT planting_management_plan_share_percent_check',
  );

  await knex.schema.alterTable('planting_management_plan', (table) => {
    table.dropColumn('share_percent');
    table.dropColumn('share_set_by_user');
  });

  await knex.schema.alterTable('management_plan', (table) => {
    table.dropColumn('sowing_date_precision');
    table.dropColumn('approximate_age');
    table.dropColumn('seed_supplier');
    table.dropColumn('organic');
    table.dropColumn('genetically_engineered');
    table.dropColumn('searched');
    table.dropColumn('treated');
  });

  await knex.schema.alterTable('crop_variety', (table) => {
    table.dropColumn('represents_crop');
  });

  await knex.schema.dropTable('farm_crop');
};
