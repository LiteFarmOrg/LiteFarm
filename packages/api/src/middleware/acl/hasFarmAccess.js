const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../../knexfile')[environment];
const knex = Knex(config);
module.exports = async (req, res, next) => {
  const data = Object.keys(req.body).length === 0 ? req.params : req.body;
  const headers = req.headers;
  const { farm_id } = headers;
  if (data.field_id) {
    const field = await fromField(data.field_id);
    return sameFarm(field, farm_id) ? next() : notAuthorizedResponse(res);
  }
  if (data.field_crop_id) {
    const field = await fromFieldCrop(data.field_crop_id);
    return sameFarm(field, farm_id) ? next() : notAuthorizedResponse(res);
  }
  if (data.crop_id) {
    const crop = await fromCrop(data.crop_id);
    return sameFarm(crop, farm_id) ? next() : notAuthorizedResponse(res);
  }
  if (data.fertilizer_id) {
    const fertilizer = await fromFertilizer(data.fertilizer_id);
    return sameFarm(fertilizer, farm_id) ? next() : notAuthorizedResponse(res);
  }
  if (data.pesticide_id) {
    const pesticide = await fromPesticide(data.pesticide_id);
    return sameFarm(pesticide, farm_id) ? next() : notAuthorizedResponse(res);
  }
  if (data.task_type_id) {
    const task = await fromTask(data.task_type_id);
    return sameFarm(task, farm_id) ? next() : notAuthorizedResponse(res);
  }
  if (data.farm_id) {
    return sameFarm(data, farm_id) ? next() : notAuthorizedResponse(res);
  }
  if (data.disease_id) {
    const disease = await fromDisease(data.disease_id);
    return sameFarm(disease, farm_id) ? next() : notAuthorizedResponse(res);
  }

  // It doesn't hold farm relationships
  next();
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
