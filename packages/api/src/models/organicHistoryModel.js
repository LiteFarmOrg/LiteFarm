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

const baseModel = require('./baseModel')

class OrganicHistory extends baseModel {
  static get tableName() {
    return 'organic_history';
  }

  static get idColumn() {
    return 'organic_history_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id', 'organic_status', 'effective_date'],
      properties: {
        organic_history_id: { type: 'string' },
        location_id: { type: 'string' },
        organic_status: { type: 'string', enum: ['Non-Organic', 'Transitional', 'Organic'] },
        effective_date: { type: 'date' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get modifiers() {
    return {
      orderByEffectiveDate(builder) {
        builder.orderBy('effective_date');
      },
    };
  }

  /**
  * Gets organic status for a specified location and date.
  * @param {string} locationId - The uuid of the target location.
  * @param {string} targetDate
  * @returns {string} The location's organic status on the target date.
  */
  static async getOrganicStatus(locationId, targetDate) {
    const data = await OrganicHistory.knex().raw(`
    SELECT effective_date, organic_status 
    FROM organic_history 
    WHERE effective_date <= ? 
    AND location_id = ? 
    ORDER BY effective_date DESC LIMIT 1;
    `, [targetDate, locationId],
    );

    return data.rows[0]?.organic_status ? data.rows[0].organic_status : '';
  }

  /**
* Gets organic status for a specified location and date range.
* @param {string} locationId - The uuid of the target location.
* @param {string} startDate - The first day of the date range.
* @param {string} endDate - The last day of the date range.
* @returns {string} The location's organic status for the date range.
*/
  static async getOrganicStatusForDateRange(locationId, startDate, endDate) {
    if (new Date(startDate) > new Date(endDate)) return '';

    const startStatus = await OrganicHistory.getOrganicStatus(locationId, startDate);
    const endStatus = await OrganicHistory.getOrganicStatus(locationId, endDate);

    if (endStatus === 'Non-Organic') return 'Non-Organic';
    else if (startStatus === endStatus) return startStatus;
    else return 'Transitional';
  }
}

module.exports = OrganicHistory;
