/*
 *  Copyright 2019-2022 LiteFarm.org
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

const baseModel = require('./baseModel');

class Notification extends baseModel {
  static get tableName() {
    return 'notification';
  }

  static get idColumn() {
    return 'notification_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['title', 'body'],
      properties: {
        notification_id: { type: 'string' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        body: { type: 'string', minLength: 1, maxLength: 10000 },
        ref_table: {
          type: 'string',
          enum: ['task', 'location', 'users', 'farm', 'document', 'export'],
        },
        ref_subtable: {
          type: 'string',
          enum: [
            'cleaning_task',
            'field_work_task',
            'harvest_task',
            'irrigation_task',
            'location_tasks',
            'management_tasks',
            'pest_control_task',
            'plant_task',
            'sale_task',
            'scouting_task',
            'shiftTask',
            'social_task',
            'soil_task',
            'soil_amendment_task',
            'transplant_task',
            'transport_task',
            'wash_and_pack_task',
            'area',
            'barn',
            'buffer_zone',
            'ceremonial_area',
            'farm_site_boundary',
            'fence',
            'field',
            'figure',
            'garden',
            'gate',
            'greenhouse',
            'line',
            'natural_area',
            'point',
            'residence',
            'surface_water',
            'watercourse',
            'water_valve',
          ],
        },
        ref_pk: { type: 'string' },
        farm_id: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

module.exports = Notification;
