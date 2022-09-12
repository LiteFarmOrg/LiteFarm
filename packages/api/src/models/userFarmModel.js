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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import { Model } from 'objection';
import UserModel from './userModel.js';
import FarmModel from './farmModel.js';
import RoleModel from './roleModel.js';

class userFarm extends Model {
  static get tableName() {
    return 'userFarm';
  }

  static get idColumn() {
    return ['user_id', 'farm_id'];
  }

  static get hidden() {
    return ['created_at', 'created_by_user_id', 'updated_by_user_id', 'updated_at', 'deleted'];
  }

  static get hiddenFromOtherUsers() {
    return ['gender', 'birth_year', 'notification_setting'];
  }

  async $afterFind(queryContext) {
    await super.$afterFind(queryContext);
    const { hidden, hiddenFromOtherUsers } = this.constructor;
    if (hidden.length > 0) {
      const { showHidden, user_id } = queryContext;
      if (!showHidden) {
        let fieldsToBeHidden = [];
        if (this.user_id === user_id) {
          fieldsToBeHidden = hidden;
        } else {
          fieldsToBeHidden = [...hidden, ...hiddenFromOtherUsers];
        }
        for (const property of fieldsToBeHidden) {
          delete this[property];
        }
      }
    }
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'farm_id'],

      properties: {
        user_id: { type: 'string' },
        farm_id: { type: 'string' },
        role_id: { type: 'number' },
        has_consent: { type: ['boolean', 'null'] },
        status: {
          type: 'enum',
          enum: ['Active', 'Inactive', 'Invited'],
        },
        created_at: { type: 'string' },
        consent_version: { type: 'string' },
        wage: {
          type: ['object', null],
          required: ['type', 'amount'],
          properties: {
            type: {
              type: 'string',
              enum: ['hourly', 'annually'],
            },
            amount: { type: ['number', null] },
            dont_ask_again: { type: ['boolean', 'null'] },
          },
        },
        step_one: { type: ['boolean', 'null'] },
        step_one_end: { type: ['string', 'null'] },
        step_two: { type: ['boolean', 'null'] },
        step_two_end: { type: ['string', 'null'] },
        step_three: { type: ['boolean', 'null'] },
        step_three_end: { type: ['string', 'null'] },
        step_four: { type: ['boolean', 'null'] },
        step_four_end: { type: ['string', 'null'] },
        step_five: { type: ['boolean', 'null'] },
        step_five_end: { type: ['string', 'null'] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      user: {
        modelClass: UserModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'userFarm.user_id',
          to: 'users.user_id',
        },
      },
      farm: {
        modelClass: FarmModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'userFarm.farm_id',
          to: 'farm.farm_id',
        },
      },
      role: {
        modelClass: RoleModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'userFarm.role_id',
          to: 'role.role_id',
        },
      },
    };
  }

  /**
   * Retrieves role for a specified user.
   * @param {uuid} userId - The specified user.
   * @static
   * @async
   * @returns {number} Number corresponding to role_id.
   */
  static async getUserRoleId(userId) {
    return userFarm
      .query()
      .join('role', 'userFarm.role_id', 'role.role_id')
      .select('role.role_id')
      .where('userFarm.user_id', userId)
      .first();
  }

  /**
   * Checks if the user exists on a particular farm.
   * @param user_id
   * @param farm_id
   * @return {Objection.QueryBuilder<userFarm, userFarm>}
   * @static
   * @async
   */
  static async checkIfUserExistsOnFarm(user_id, farm_id) {
    return userFarm.query().where({ user_id, farm_id }).first();
  }

  /**
   * Gets a userFarm record by email.
   * @param email
   * @param farm_id
   * @param trx - optional transaction
   * @return {Objection.QueryBuilder<userFarm, userFarm>}
   */
  static async getUserFarmByEmail(email, farm_id, trx) {
    const transaction = trx ?? (await this.startTransaction());
    const result = await userFarm
      .query(transaction)
      .join('users', 'userFarm.user_id', '=', 'users.user_id')
      .join('farm', 'farm.farm_id', '=', 'userFarm.farm_id')
      .join('role', 'userFarm.role_id', '=', 'role.role_id')
      .where({ 'users.email': email, 'userFarm.farm_id': farm_id })
      .first()
      .select('*');
    if (trx === null || trx === undefined) {
      await transaction.commit();
    }
    return result;
  }
  /**
   * Gets the userIds of FM/FO/EO from the farm with the given farmId
   * @param {uuid} farmId - The specified user.
   * @static
   * @async
   * @returns {Object} Object {userId} of FM/FO/EO
   */
  static async getFarmManagementByFarmId(farmId) {
    return userFarm
      .query()
      .select('user_id')
      .whereIn('role_id', [1, 2, 5])
      .where('userFarm.farm_id', farmId);
  }

  /**
   * Gets the userIds of active users from a given farm
   * @param {uuid} farmId farm id
   * @static
   * @async
   * @returns {Array} Array [user_id]
   */
  static async getActiveUsersFromFarmId(farmId) {
    return userFarm
      .query()
      .select('userFarm.user_id')
      .join('users', 'userFarm.user_id', 'users.user_id')
      .where('userFarm.farm_id', farmId)
      .andWhere('users.status_id', 1);
  }
}

export default userFarm;
