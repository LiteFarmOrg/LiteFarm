/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (logController.js) is part of LiteFarm.
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

const baseController = require('../controllers/baseController');
const { transaction } = require('objection');
const { Model } = require('objection');
const ExceptionHandler = require('../LiteFarmUtility/exceptionHandler');
const lodash = require('lodash');

const ActivityLogModelModel = require('../models/activityLogModel');
const FertilizerLogModel = require('../models/fertilizerLogModel');
const PestControlLogModel = require('../models/pestControlLogModel');
const ScoutingLogModel = require('../models/scoutingLogModel');
const IrrigationLogModel = require('../models/irrigationLogModel');
const FieldWorkLogModel = require('../models/fieldWorkLogModel');
const SoilDataLog = require('../models/soilDataLogModel');
const SeedLog = require('../models/seedLogModel');
const fieldCropModel = require('../models/fieldCropModel');
const HarvestLog = require('../models/harvestLogModel');
const fieldModel = require('../models/fieldModel');
const locationModel = require('../models/locationModel');
const HarvestUseTypeModel = require('../models/harvestUseTypeModel');
const HarvestUseModel = require('../models/harvestUseModel');

const logController = {
  addLog() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        if (!lodash.isEmpty(req.body)) {
          await logServices.insertLog(req, trx);
          await trx.commit();
        }
        res.sendStatus(200);
      } catch (exception) {
        await trx.rollback();
        var error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error: error.message });
      }
    };
  },

  getLogByActivityId() {
    return async (req, res) => {
      try {
        if (req.params.activity_id) {
          const activity_id = req.params.activity_id;
          const log = await logServices.getLogById(activity_id);
          res.json(log);
        } else {
          res.status(200).json([]);
        }
      } catch (exception) {
        const error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error: error.message });
      }
    };
  },

  getLogByFarmId() {
    return async (req, res) => {
      try {
        if (req.params.farm_id) {
          const farm_id = req.params.farm_id;
          const logs = await logServices.getLogByFarm(farm_id);
          if (logs && !logs.length) {
            res.json([]);
          } else {
            res.json(logs);
          }
        } else {
          res.status(200).json([]);
        }
      } catch (exception) {
        const error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error: error.message });
      }
    };
  },

  getHarvestUseTypesByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await HarvestUseTypeModel.query().where('farm_id', null).orWhere({ farm_id });
        if (!rows.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(rows);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  addHarvestUseType() {
    return async (req, res) => {
      const { farm_id } = req.headers;
      const { name } = req.body;
      const trx = await transaction.start(Model.knex());
      try {
        const check = await HarvestUseTypeModel.query().where({ farm_id, harvest_use_type_name: name }).first();
        if (check) {
          await trx.rollback();
          return res.status(400).send('Cannot make duplicate type for this farm');
        }
        const harvest_use_type = {
          farm_id,
          harvest_use_type_name: name,
          harvest_use_type_translation_key: name,
        };
        const result = await baseController.post(HarvestUseTypeModel, harvest_use_type, req, { trx });
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

  deleteLog() {
    return async (req, res) => {
      try {
        if (req.params.activity_id) {
          await baseController.delete(ActivityLogModelModel, req.params.activity_id, req);
          return res.sendStatus(200);
        } else {
          throw { code: 400, message: 'No log id defined' };
        }
      } catch (exception) {
        //HANDLE USER UNABLE TO DELETE
        const error = ExceptionHandler.handleException(exception);
        return res.status(error.status).json({ error: error.message });
      }
    };
  },

  putLog() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        if (req.params.activity_id) {
          await logServices.patchLog(req.params.activity_id, trx, req);
          await trx.commit();
          res.sendStatus(200);
        } else {
          throw { code: 400, message: 'No log id defined' };
        }

      } catch (exception) {
        await trx.rollback();
        const error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error: error.message });
      }
    };
  },
};

const logServices = {

  async insertLog(req, trx) {
    const { body, user } = req;
    const logModel = getActivityModelKind(body.activity_kind);
    const user_id = user.user_id;
    const activityLog = await baseController.post(ActivityLogModelModel, body, req, { trx });
    //insert crops,fields and beds
    await baseController.relateModels(activityLog, fieldCropModel, body.crops, trx);
    await baseController.relateModels(activityLog, locationModel, body.fields, trx);
    if (!logModel.isOther && !(logModel.tableName === 'harvestLog')) {
      await baseController.postRelated(activityLog, logModel, body, req, { trx });
    } else if (logModel.tableName === 'harvestLog') {
      await baseController.postRelated(activityLog, logModel, body, req, { trx });
      const uses = body.selectedUseTypes.map(async (use) => {
        const data = {
          activity_id: activityLog.activity_id,
          harvest_use_type_id: use.harvest_use_type_id,
          quantity_kg: use.quantity_kg,
        };
        return baseController.post(HarvestUseModel, data, req, { trx });
      });
      await Promise.all(uses);
    }
    return activityLog;
  },

  async getLogById(id) {
    const log = await baseController.getIndividual(ActivityLogModelModel, id);
    if (!(log && log[0])) {
      throw new Error('Log not found');
    }
    const logKind = getActivityModelKind(log[0].activity_kind);
    if (logKind !== null) {
      await baseController.getRelated(log[0], logKind);
    }
    return log[0];
  },

  async getLogByFarm(farm_id) {
    const logs = await ActivityLogModelModel.query().whereNotDeleted()
      .distinct('users.first_name', 'users.last_name', 'activityLog.activity_id', 'activityLog.activity_kind',
        'activityLog.date', 'activityLog.user_id', 'activityLog.notes', 'activityLog.action_needed', 'activityLog.photo')
      .join('activityFields', 'activityFields.activity_id', 'activityLog.activity_id')
      .join('location', 'location.location_id', 'activityFields.location_id')
      .join('userFarm', 'userFarm.farm_id', '=', 'location.farm_id')
      .join('users', 'users.user_id', '=', 'activityLog.user_id')
      .where('userFarm.farm_id', farm_id);
    for (const log of logs) {
      // get fields and fieldCrops associated with log
      await log.$fetchGraph('fieldCrop.crop');
      await baseController.getRelated(log, locationModel);

      // get related models for specialized logs
      const logKind = getActivityModelKind(log.activity_kind);
      if (!logKind.isOther) {
        await baseController.getRelated(log, logKind);
      }
      if (logKind === HarvestLog) {
        await baseController.getRelated(log, HarvestUseModel);
        for (const use of log.harvestUse) {
          await baseController.getRelated(use, HarvestUseTypeModel);
        }
      }
    }
    return logs;


  },

  async patchLog(logId, trx, req) {
    const { body, user } = req;
    const log = await baseController.getIndividual(ActivityLogModelModel, logId);
    const user_id = user.user_id;
    const activityLog = await baseController.updateIndividualById(ActivityLogModelModel, logId, body, req, { trx });

    //insert fieldCrops,fields
    // TODO: change body.crops to body.fieldCrops
    await baseController.relateModels(activityLog, fieldCropModel, body.crops, trx);
    // TODO: Deprecate fields field in req.body
    await baseController.relateModels(activityLog, locationModel, body.fields, trx);

    const logKind = getActivityModelKind(log[0].activity_kind);
    if (!logKind.isOther) {
      await baseController.updateIndividualById(logKind, logId, body, req, { trx });
    }
    if (log[0].activity_kind === 'harvest') {
      await HarvestUseModel.query().context({ user_id }).where({ activity_id: logId }).delete();
      for (const use of body.selectedUseTypes) {
        const data = {
          activity_id: activityLog.activity_id,
          harvest_use_type_id: use.harvest_use_type_id,
          quantity_kg: use.quantity_kg,
        };
        await baseController.post(HarvestUseModel, data, req, { trx });
      }
    }
  },
};

function getActivityModelKind(activity_kind) {


  if (activity_kind === 'fertilizing') {
    return FertilizerLogModel;
  } else if (activity_kind === 'pestControl') {
    return PestControlLogModel;
  } else if (activity_kind === 'scouting') {
    return ScoutingLogModel;
  } else if (activity_kind === 'irrigation') {
    return IrrigationLogModel;
  } else if (activity_kind === 'harvest') {
    return HarvestLog;
  } else if (activity_kind === 'fieldWork') {
    return FieldWorkLogModel;
  } else if (activity_kind === 'soilData') {
    return SoilDataLog;
  } else if (activity_kind === 'others') {
    return null;
  } else if (activity_kind === 'seeding') {
    return SeedLog;
  } else if (activity_kind === 'other') {
    return { isOther: true };
  }
  throw 'Unknown log type';
}

module.exports.logController = logController;
module.exports.logServices = logServices;
