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

const ActivityLogModel = require('../models/activityLogModel');
const FertilizerLog = require('../models/fertilizerLogModel');
const PestControlLog = require('../models/pestControlLogModel');
const ScoutingLog = require('../models/scoutingLogModel');
const IrrigationLog = require('../models/irrigationLogModel');
const FieldWorkLog = require('../models/fieldWorkLogModel');
const SoilDataLog = require('../models/soilDataLogModel');
const SeedLog = require('../models/seedLogModel');
const fieldCrop = require('../models/fieldCropModel');
const HarvestLog = require('../models/harvestLogModel');
const field = require('../models/fieldModel');

class logController extends baseController {
  static addLog() {
    return async (req, res) => {
      const transac = await transaction.start(Model.knex());
      try{

        if(!lodash.isEmpty(req.body)){
          await logServices.insertLog(req.body, transac);
          await transac.commit();
        }
        res.sendStatus(200);
      }catch(exception){
        await transac.rollback();
        var error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error: error.message });
      }
    };
  }


  static getLog(){
    return async (req, res) => {
      try{
        const query = req.query;
        if(query.logid || query.logId){
          var logId = (query.logId != null) ? query.logId : query.logid;

          var log = await logServices.getLogById(logId);
          res.json(log);
        }else if(query.farmId || query.farmid){
          //find by user id
          var farmId = (query.farmId != null) ? query.farmId : query.farmid;
          var logs = await logServices.getLogByFarm(farmId);
          if(logs && !logs.length){
            res.json([{}]);
          }else{
            res.json(logs);
          }
        }else{
          res.status(200).json([]);
        }
      }catch(exception){
        const error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error:error.message });
      }
    }
  }

  static deleteLog(){
    return async (req, res) => {
      try{
        if(req.params.id){
          await logServices.deleteLog(req.params.id);
          res.sendStatus(200);
        }else{
          throw { code:400, message:'No log id defined' }
        }
      }catch(exception){
        //HANDLE USER UNABLE TO DELETE
        const error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error: error.message });
      }
    }
  }

  static putLog(){
    return async(req, res)=>{
      try{
        if(req.params.id){
          const transac = await transaction.start(Model.knex());
          await logServices.patchLog(req.params.id, transac, req.body);
          await transac.commit();
          res.sendStatus(200);
        }else{
          throw { code:400, message:'No log id defined' }
        }

      }catch(exception){
        const error = ExceptionHandler.handleException(exception);
        res.status(error.status).json({ error: error.message });
      }
    }
  }
}

class logServices extends baseController {
  constructor() {
    super();
  }

  static async insertLog(data, transaction){
    const logModel = getActivityModelKind(data.activity_kind);
    const activityLog = await super.post(ActivityLogModel, data, transaction);

    //insert crops,fields and beds
    await super.relateModels(activityLog, fieldCrop, data.crops, transaction);
    await super.relateModels(activityLog, field, data.fields, transaction);
    if (!logModel.isOther) {
      await super.postRelated(activityLog, logModel, data, transaction);
    }
  }

  static async getLogById(id){
    const log = await super.getIndividual(ActivityLogModel, id);
    const logKind = getActivityModelKind(log[0].activity_kind);
    if(logKind !== null){
      await super.getRelated(log[0], logKind);
    }
    return log[0];
  }

  static async getLogByFarm(farm_id){
    var logs = await ActivityLogModel.query()
      .distinct('users.first_name', 'users.last_name', 'activityLog.activity_id', 'activityLog.activity_kind',
        'activityLog.date', 'activityLog.user_id', 'activityLog.notes', 'activityLog.action_needed', 'activityLog.photo')
      .join('userFarm', 'userFarm.user_id', '=', 'activityLog.user_id')
      .join('users', 'users.user_id', '=', 'activityLog.user_id')
      .join('farm', 'farm.farm_id', '=', 'userFarm.farm_id')
      .where('farm.farm_id', farm_id);
    for(var log of logs){
      // get fields and fieldCrops associated with log
      await log.$loadRelated('fieldCrop.crop');
      await super.getRelated(log, field);

      // get related models for specialized logs
      var logKind = getActivityModelKind(log.activity_kind);
      if (!logKind.isOther) {
        await super.getRelated(log, logKind);
      }
    }
    return logs;
  }

  static async patchLog(logId, transaction, updatedLog){
    var log = await super.getIndividual(ActivityLogModel, logId);
    const activityLog = await super.updateIndividualById(ActivityLogModel, logId, updatedLog, transaction);

    //insert fieldCrops,fields
    await super.relateModels(activityLog, fieldCrop, updatedLog.crops, transaction);
    await super.relateModels(activityLog, field, updatedLog.fields, transaction);

    var logKind = getActivityModelKind(log[0].activity_kind);
    if (!logKind.isOther) {
      await super.updateIndividualById(logKind, logId, updatedLog, transaction)
    }
  }

  static async deleteLog(logId, trasnaction){
    await super.delete(ActivityLogModel, logId, trasnaction);
  }
}

function getActivityModelKind(activity_kind){


  if(activity_kind === 'fertilizing'){
    return  FertilizerLog;
  }else if(activity_kind === 'pestControl'){
    return PestControlLog;
  }else if(activity_kind === 'scouting'){
    return ScoutingLog;
  }else if(activity_kind === 'irrigation'){
    return IrrigationLog;
  }else if(activity_kind === 'harvest'){
    return HarvestLog;
  }else if(activity_kind === 'fieldWork') {
    return FieldWorkLog;
  }else if(activity_kind === 'soilData'){
    return SoilDataLog;
  }else if(activity_kind === 'others'){
    return null;
  }else if(activity_kind === 'seeding'){
    return SeedLog;
  }else if(activity_kind === 'other'){
    return { isOther:true };
  }
  throw 'Unknown log type'
}

module.exports.logController = logController;
module.exports.logServices = logServices;
