/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldModel.js) is part of LiteFarm.
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

const { transaction, Model } = require('objection');
const baseModel = require('./baseModel');
const { getNonModifiable } = require('../middleware/validation/location');

class Location extends baseModel {
  static get tableName() {
    return 'location';
  }

  static get idColumn() {
    return 'location_id';
  }

  static get hidden() {
    return ['created_at', 'created_by_user_id', 'updated_by_user_id', 'updated_at'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id', 'name'],
      properties: {
        location_id: { type: 'string' },
        farm_id: { type: 'string' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        notes: { type: 'string', maxLength: 10000 },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      figure: {
        modelClass: require('./figureModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'figure.location_id',
        },
      },
      field: {
        modelClass: require('./fieldModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'field.location_id',
        },
      },
      garden: {
        modelClass: require('./gardenModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'garden.location_id',
        },
      },
      barn: {
        modelClass: require('./barnModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'barn.location_id',
        },
      },
      buffer_zone: {
        modelClass: require('./bufferZoneModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'buffer_zone.location_id',
        },
      },
      ceremonial_area: {
        modelClass: require('./ceremonialAreaModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'ceremonial_area.location_id',
        },
      },
      watercourse: {
        modelClass: require('./watercourseModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'watercourse.location_id',
        },
      },
      fence: {
        modelClass: require('./fenceModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'fence.location_id',
        },
      },
      gate: {
        modelClass: require('./gateModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'gate.location_id',
        },
      },
      greenhouse: {
        modelClass: require('./greenhouseModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'greenhouse.location_id',
        },
      },
      farm_site_boundary: {
        modelClass: require('./farmSiteBoundary'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'farm_site_boundary.location_id',
        },
      },
      surface_water: {
        modelClass: require('./surfaceWaterModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'surface_water.location_id',
        },
      },
      natural_area: {
        modelClass: require('./naturalAreaModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'natural_area.location_id',
        },
      },
      residence: {
        modelClass: require('./residenceModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'residence.location_id',
        },
      },
      pin: {
        modelClass: require('./pinModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'pin.location_id',
        },
      },
      water_valve: {
        modelClass: require('./waterValveModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'water_valve.location_id',
        },
        task: {
          modelClass: require('./taskModel'),
          relation: Model.ManyToManyRelation,
          join: {
            from: 'location.location_id',
            through: {
              modelClass: require('./locationTasksModel'),
              from: 'location_tasks.task_id',
              to: 'location_tasks.location_id',
            },
            to: 'task.task_id',
          },
        },
      },
      sensor: {
        modelClass: require('./sensorModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'location.location_id',
          to: 'sensor.location_id',
        },
      },
    };
  }

  static async createLocation(asset, context, locationData, trx) {
    const nonModifiable = getNonModifiable(asset);
    return await Location.query(trx)
      .context(context)
      .insertGraph(locationData, { noUpdate: true, noDelete: true, noInsert: nonModifiable });
  }

  static async createOrUpdateLocation(asset, context, locationData, trx) {
    const nonModifiable = getNonModifiable(asset);
    return await Location.query(trx)
      .context(context)
      .upsertGraph(locationData, { noUpdate: false, noDelete: true, noInsert: nonModifiable });
  }

  static async deleteLocation(location_id, context) {
    try {
      const trx = await transaction.start(Model.knex());
      const deleteResponse = await Location.query(trx)
        .context(context)
        .patch({ deleted: true })
        .where('location_id', location_id);
      await trx.commit();
      return deleteResponse;
    } catch (error) {
      return error;
    }
  }

  static async getSensorLocation(farm_id, partner_id, external_id, trx) {
    return Location.query(trx)
      .withGraphJoined('sensor')
      .where('sensor.farm_id', farm_id)
      .andWhere('sensor.partner_id', partner_id)
      .andWhere('sensor.external_id', external_id)
      .first();
  }

  static async unDeleteLocation(user_id, location_id, trx) {
    return Location.query(trx)
      .context({ user_id })
      .where({ location_id })
      .patch({ deleted: false });
  }
}

module.exports = Location;
