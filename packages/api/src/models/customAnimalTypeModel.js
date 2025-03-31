/*
 *  Copyright 2024 LiteFarm.org
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

import baseModel from './baseModel.js';
import knex from '../util/knex.js';

class CustomAnimalType extends baseModel {
  static get tableName() {
    return 'custom_animal_type';
  }

  static get idColumn() {
    return 'id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id', 'type'],

      properties: {
        id: { type: 'integer' },
        farm_id: { type: 'string' },
        type: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static async getCustomAnimalTypesWithCountsByFarmId(farm_id) {
    const data = await knex.raw(
      `SELECT
        cat.id, cat.farm_id, cat.type,
        COALESCE(SUM(abu.count), 0) AS count
      FROM
        custom_animal_type AS cat
      LEFT JOIN (
        SELECT custom_type_id, COUNT(*) AS count
        FROM animal WHERE farm_id = ? AND deleted is FALSE AND animal_removal_reason_id is NULL
        GROUP BY custom_type_id
        UNION ALL
        SELECT custom_type_id, SUM(count) AS count
        FROM animal_batch WHERE farm_id = ? AND deleted is FALSE AND animal_removal_reason_id is NULL
        GROUP BY custom_type_id
      ) AS abu ON cat.id = abu.custom_type_id
      WHERE farm_id = ? AND deleted is FALSE
      GROUP BY cat.id;`,
      [farm_id, farm_id, farm_id],
    );
    return data.rows;
  }
}

export default CustomAnimalType;
