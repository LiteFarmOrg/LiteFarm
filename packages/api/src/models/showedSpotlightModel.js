/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (showedSpotlightModel.js) is part of LiteFarm.
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

const Model = require('objection').Model;

class ShowedSpotlight extends Model {
  static get tableName() {
    return 'showedSpotlight';
  }

  static get idColumn() {
    return 'user_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        user_id: { type: 'string' },
        map: { type: 'string' },
        map_end: { type: ['date-time', 'null'] },
        draw_area: { type: 'string' },
        draw_area_end: { type: ['date-time', 'null'] },
        draw_line: { type: 'string' },
        draw_line_end: { type: ['date-time', 'null'] },
        drop_point: { type: 'string' },
        drop_point_end: { type: ['date-time', 'null'] },
        adjust_area: { type: 'string' },
        adjust_area_end: { type: ['date-time', 'null'] },
        adjust_line: { type: 'string' },
        adjust_line_end: { type: ['date-time', 'null'] },
      },
    };
  }
  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      user: {
        modelClass: require('./userModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'showedSpotlight.user_id',
          to: 'users.user_id',
        },
      },
    };
  }

  // async $beforeInsert(context) {
  //   await super.$beforeInsert(context);
  //   this.created_at = new Date().toISOString();
  // }
}

module.exports = ShowedSpotlight;
