/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userFarmModel.js) is part of LiteFarm.
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

const BaseModel = require('./baseModel');

class supportTicketModel extends BaseModel {
  static get tableName() {
    return 'supportTicket';
  }

  static get idColumn() {
    return 'support_ticket_id'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['support_type', 'message', 'contact_method'],
      properties: {
        support_ticket_id: { type: 'string' },
        support_type: {
          type: 'string',
          enum: ['Request information', 'Report a bug', 'Request a feature', 'Other'],
        },
        message: { type: 'string' },
        attachments: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        contact_method: {
          type: 'string',
          enum: ['email', 'whatsapp'],
        },
        email: { type: 'string' },
        whatsapp: { type: 'string' },
        status: {
          type: 'string',
          enum: ['Open', 'Closed', 'In progress'],
        },
        farm_id: { type: 'string' },
        ...super.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
    }
  }
}

module.exports = supportTicketModel;
