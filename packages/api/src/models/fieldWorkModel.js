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

import { Model } from 'objection';
import farmModel from './farmModel.js';
import baseModel from './baseModel.js';

class FieldWorkModel extends baseModel {
  static get tableName() {
    return 'field_work';
  }

  static get idColumn() {
    return 'field_work_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['field_work_type_translation_key'],

      properties: {
        field_work_id: { type: 'integer' },
        field_work_name: { type: 'string' },
        field_work_type_translation_key: { type: 'string' },
        farm_id: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      farm: {
        relation: Model.BelongsToOneRelation,
        modelClass: farmModel,
        join: {
          from: 'field_work.farm_id',
          to: 'farm.farm_id',
        },
      },
    };
  }

  static async insertCustomFieldWorkType(row) {
    const data = await Model.knex().raw(
      `
      SELECT * FROM public.field_work WHERE field_work_name = ? AND  field_work_type_translation_key = ?;
    `,
      [row.field_work_name, row.field_work_type_translation_key],
    );
    if (data.rowCount > 0) {
      return data.rows[0];
    } else {
      const data = await Model.knex().raw(
        `
        INSERT INTO public.field_work(
          farm_id, field_work_name, field_work_type_translation_key, created_by_user_id, updated_by_user_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW()) RETURNING *;
        `,
        [
          row.farm_id,
          row.field_work_name,
          row.field_work_type_translation_key,
          row.created_by_user_id,
          row.updated_by_user_id,
        ],
      );
      return data.rows[0];
    }
  }
  static async getAllFieldWorkTypesByFarmId(farm_id) {
    const data = await Model.knex()
      .raw(
        `
      SELECT field_work_id, farm_id, 
      'ADD_TASK.FIELD_WORK_VIEW.TYPE.' || field_work_type_translation_key as label, 
      field_work_type_translation_key as value,
      field_work_name 
      FROM public.field_work WHERE farm_id = ? OR farm_id IS NULL;
    `,
        [farm_id],
      )
      .debug();
    return data.rows;
  }
}
export default FieldWorkModel;
