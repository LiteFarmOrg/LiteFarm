const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../../knexfile')[environment];
const knex = Knex(config);
const seededEntities = ['pesticide_id', 'disease_id', 'task_type_id', 'crop_id', 'fertilizer_id'];
const entitiesGetters = {
  fertilizer_id: fromFertilizer,
  field_id: fromField,
  field_crop_id: fromFieldCrop,
  crop_id: fromCrop,
  pesticide_id: fromPesticide,
  task_type_id: fromTask,
  disease_id: fromDisease,
  farm_id: (farm_id) => ({ farm_id }),
  fertilizerLog: fromFertilizerLog,
}
module.exports = ({ params = null, body = null, customized = null }) => async (req, res, next) => {
  let id_name;
  let id;
  if(customized){
    return await entitiesGetters[customized](req, res, next);
  }
  if(params){
    id_name = params;
    id = req.params[id_name];
  }else{
    id_name = body;
    id = req.body[id_name];
  }
  if (!id_name) {
    return next()
  }
  const { farm_id } = req.headers;
  const farmIdObjectFromEntity = await entitiesGetters[id_name](id);
  // Is getting a seeded table and accessing community data. Go through.
  // TODO: try to delete seeded data
  if(seededEntities.includes(id_name) && req.method === 'GET' && farmIdObjectFromEntity.farm_id === null) {
    return next();
  }
  return sameFarm(farmIdObjectFromEntity, farm_id) ? next() : notAuthorizedResponse(res);
}

async function fromTask(taskId) {
  return await knex('taskType').where({ task_id: taskId }).first();
}

async function fromPesticide(pesticideId) {
  return await knex('pesticide').where({ pesticide_id: pesticideId }).first();
}

async function fromDisease(disease_id) {
  return await knex('disease').where({ disease_id }).first();
}

async function fromCrop(cropId) {
  return await knex('crop').where({ crop_id: cropId }).first();
}

async function fromFertilizer(fertilizerId) {
  return await knex('fertilizer').where({ fertilizer_id: fertilizerId }).first();
}

async function fromField(fieldId) {
  return await knex('field').where({ field_id: fieldId }).first();
}

async function fromFieldCrop(fieldCropId) {
  const { field_id } = await knex('fieldCrop').where({ field_crop_id: fieldCropId }).first();
  return fromField(field_id);
}

function sameFarm(object, farm) {
  return object.farm_id === farm;
}

function notAuthorizedResponse(res) {
  res.status(403).send('user not authorized to access farm');
}

async function fromFertilizerLog(req, res, next){
  const { user_id:header_user_id, farm_id:header_farm_id } = req.headers;
  const { farm_id:params_farm_id, activity_id: params_activity_id } = req.params;
  const body = req.body;
  let test1 = (body.activity_id && params_activity_id && Number(params_activity_id) !==body.activity_id);
  let test2 = (params_farm_id && header_farm_id!==params_farm_id);
  if(body.farm_id || (body.user_id && body.user_id !== header_user_id) || (body.activity_id && params_activity_id && Number(params_activity_id) !==body.activity_id) || (params_farm_id && header_farm_id!==params_farm_id)){
    return res.status(400).send('bad request');
  }
  const field_ids = body.fields?body.fields.map((field)=> field.field_id):undefined;
  const field_crop_ids = body.crops?body.crops.map((crop) => crop.field_crop_id):undefined;
  const fertilizer_id = body.fertilizer_id;
  const ActivityLogModel = require('../../models/activityLogModel');
  let logs;
  try{
    logs = await ActivityLogModel.query()
      .distinct('activityLog.activity_id', 'activityLog.user_id', 'userFarm.user_id', 'userFarm.farm_id', 'field.farm_id')
      // .join('activityCrops', 'activityCrops.activity_id', 'activityLog.activity_id')
      // .join('activityFields', 'activityFields.activity_id', 'activityLog.activity_id')
      // .join('fertilizerLog', 'fertilizerLog.activity_id', 'activityLog.activity_id')
      .rightJoin('userFarm', 'activityLog.user_id', 'userFarm.user_id')
      .join('fertilizer', 'fertilizer.farm_id', 'userFarm.farm_id')
      .join('field', 'field.farm_id', 'userFarm.farm_id')
      .join('fieldCrop', 'fieldCrop.field_id', 'field.field_id')

      .skipUndefined()
      .where('activityLog.activity_id', params_activity_id)
      .where('userFarm.farm_id', header_farm_id)
      .where('field.farm_id', header_farm_id)
      .where('fertilizer.farm_id', header_farm_id)
      .whereIn('field.field_id', field_ids)
      .whereIn('fieldCrop.field_crop_id', field_crop_ids)
      .where('userFarm.user_id', header_user_id)
      .whereIn('fieldCrop.field_id', field_ids)
      // .where('fieldCrop.field_id = field.field_id') //TODO edge case where there are two different field with only 1 field Crop
    ;
  }catch (e){
    console.log(e);
  }
  if(logs.length>0){
    if(params_activity_id){
      try{
        if(Number(params_activity_id)!==logs[0].activity_id){
        return res.status(403).send('bad request');
      }}catch (e){
        console.log(e);
      }

    }
    return next();
  }else{
    return res.status(403).send('bad request');
  }
}