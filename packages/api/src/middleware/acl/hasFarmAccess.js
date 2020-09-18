const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../../knexfile')[environment];
const knex = Knex(config);
const orderedEntities = ['field_id', 'field_crop_id', 'crop_id', 'fertilizer_id',
  'pesticide_id', 'task_type_id', 'disease_id', 'farm_id']
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
}
module.exports = (isGet = false) => async (req, res, next) => {
  // TODO: When URL has params, try to circumvent authorization by setting farm_id in body
  // TODO: Try to add field_id in body to circumvent authorization
  const data = Object.keys(req.body).length === 0 ? req.params : req.body;
  const headers = req.headers;
  const { farm_id } = headers;
  const entityMatched = orderedEntities.find((k) => !!data[k]);
  // Has no farm relation
  if (!entityMatched) {
    return next()
  }
  const farmIdObjectFromEntity = await entitiesGetters[entityMatched](data[entityMatched]);
  // Is getting a seeded table and accessing community data. Go through.
  // TODO: try to delete seeded data
  if(seededEntities.includes(entityMatched) && isGet && farmIdObjectFromEntity.farm_id === null) {
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
