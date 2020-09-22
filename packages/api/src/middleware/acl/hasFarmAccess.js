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
    return entitiesGetters[customized](req, res, next);
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
  const { header_user_id, header_farm_id } = req.headers;
  const { params_farm_id, header_activity_id } = req.params;
  const body = req.body;
  if(body.farm_id || body.user_id || body.activity_id || header_farm_id!==params_farm_id){
    res.sendStatus(400);
  }
  const ActivityLogModel = require('../models/activityLogModel');
  let logs = await ActivityLogModel.query().whereNotDeleted()
    .distinct('activityLog.activity_id', 'activityLog.user_id')
    .join('userFarm', {})
    .join('users', 'users.user_id', '=', 'activityLog.user_id')
    .join('farm', 'farm.farm_id', '=', 'userFarm.farm_id')
    .where('farm.farm_id', header_farm_id);
}