/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

exports.up = async function (knex) {
  await knex.schema.createTable('partner_reading_type', function (table) {
    table
      .uuid('partner_reading_type_id')
      .primary()
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v1()'));
    table
      .integer('partner_id')
      .references('partner_id')
      .inTable('integrating_partner')
      .notNullable();
    table.integer('raw_value');
    table.string('readable_value');
  });

  await knex('partner_reading_type').insert([
    {
      partner_id: 1,
      readable_value: 'soil_water_content',
    },
    {
      partner_id: 1,
      readable_value: 'soil_water_potential',
    },
    {
      partner_id: 1,
      readable_value: 'temperature',
    },
  ]);

  await knex.schema.createTable('sensor_reading_type', function (table) {
    table
      .uuid('sensor_reading_type_id')
      .primary()
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v1()'));
    table
      .uuid('partner_reading_type_id')
      .references('partner_reading_type_id')
      .inTable('partner_reading_type');
    table.uuid('sensor_id').references('sensor_id').inTable('sensor');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('sensor_reading_type');
  await knex.schema.dropTable('partner_reading_type');
};
