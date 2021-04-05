const { Model } = require('objection');
const knex = Model.knex();
const seededEntities = ['pesticide_id', 'disease_id', 'task_type_id', 'crop_id', 'fertilizer_id'];
const entitiesGetters = {
  fertilizer_id: fromFertilizer,
  field_crop_id: fromFieldCrop,
  crop_id: fromCrop,
  pesticide_id: fromPesticide,
  task_type_id: fromTask,
  disease_id: fromDisease,
  yield_id: fromYield,
  price_id: fromPrice,
  farm_expense_id: fromFarmExpense,
  expense_type_id: fromFarmExpenseType,
  nitrogen_schedule_id: fromNitrogenSchedule,
  farm_id: (farm_id) => ({ farm_id }),
  fields: fromFields,
  activity_id: fromActivity,
  sale_id: fromSale,
  shift_id: fromShift,
  location_id: fromLocation,
  survey_id: fromOrganicCertifierSurvey,
}
const userFarmModel = require('../../models/userFarmModel');

module.exports = ({ params = null, body = null, mixed = null }) => async (req, res, next) => {
  let id_name;
  let id;
  if (params) {
    id_name = params;
    id = req.params[id_name];
  } else if (mixed) {
    id_name = mixed;
    id = req;
  } else {
    id_name = body;
    if (Array.isArray(req.body)) {
      id = req.body[0][id_name];
    } else {
      id = req.body[id_name];
    }
  }
  if (!id_name) {
    return next();
  }

  const { farm_id } = req.headers;
  const farmIdObjectFromEntity = await entitiesGetters[id_name](id);
  // Is getting a seeded table and accessing community data. Go through.
  if (seededEntities.includes(id_name) && req.method === 'GET' && farmIdObjectFromEntity.farm_id === null) {
    return next();
  }
  return sameFarm(farmIdObjectFromEntity, farm_id) ? next() : notAuthorizedResponse(res);
}

async function fromTask(taskId) {
  return knex('taskType').where({ task_id: taskId }).first();
}

async function fromShift(shiftId) {
  return knex('shift').where({ shift_id: shiftId }).first();
}

async function fromPesticide(pesticideId) {
  return knex('pesticide').where({ pesticide_id: pesticideId }).first();
}

async function fromNitrogenSchedule(nitrogenScheduleId) {
  return knex('nitrogenSchedule').where({ nitrogen_schedule_id: nitrogenScheduleId }).first();
}

async function fromDisease(disease_id) {
  return knex('disease').where({ disease_id }).first();
}

async function fromLocation(location_id) {
  return knex('location').where({ location_id }).first();
}

async function fromCrop(cropId) {
  return knex('crop').where({ crop_id: cropId }).first();
}

async function fromFertilizer(fertilizerId) {
  return knex('fertilizer').where({ fertilizer_id: fertilizerId }).first();
}

async function fromFields(fields) {
  if (!fields || !fields.length) {
    return {};
  }
  const field_ids = fields ? fields.map((field) => field.field_id) : undefined;
  try {
    const userFarms = await knex('field').join('userFarm', 'field.farm_id', 'userFarm.farm_id')
      .whereIn('field.field_id', field_ids).distinct('field.farm_id');
    if (userFarms.length !== 1) return {};
    return userFarms[0];
  } catch (e) {
    return {};
  }
}

async function fromActivity(req) {
  const user_id = req.user.user_id
  const { activity_id } = req.params;
  const { farm_id } = req.headers;

  if (req.body.fields) {
    const fields = [];
    let fieldCrops;
    for (const field of req.body.fields) {
      if (!field.field_id) {
        return {};
      }
      fields.push(field.field_id);
    }
    if (fields.length === 0) {
      return {};
    }

    if (req.body.crops && req.body.crops.length) {
      fieldCrops = [];
      for (const fieldCrop of req.body.crops) {
        if (!fieldCrop.field_crop_id) {
          return {};
        }
        fieldCrops.push(fieldCrop.field_crop_id);
      }
    }

    const sameFarm = await userFarmModel.query()
      .distinct('userFarm.user_id', 'userFarm.farm_id', 'field.field_id')
      .join('field', 'userFarm.farm_id', 'field.farm_id')
      .leftJoin('fieldCrop', 'fieldCrop.field_id', 'field.field_id')
      .skipUndefined()
      .whereIn('field.field_id', fields)
      .whereIn('fieldCrop.field_crop_id', fieldCrops)
      .where('userFarm.user_id', user_id)
      .where('userFarm.farm_id', farm_id)

    if (!sameFarm.length || sameFarm.length < (fieldCrops ? fieldCrops.length : 0)) {
      return {};
    }
  }
  const userFarm = await userFarmModel.query()
    .distinct('activityLog.activity_id', 'userFarm.user_id', 'userFarm.farm_id', 'field.field_id')
    .join('field', 'userFarm.farm_id', 'field.farm_id')
    .join('activityFields', 'activityFields.field_id', 'field.field_id')
    .join('activityLog', 'activityFields.activity_id', 'activityLog.activity_id')
    .skipUndefined()
    .where('activityLog.activity_id', activity_id)
    .where('userFarm.user_id', user_id)
    .where('userFarm.farm_id', farm_id)
    .first();
  if (!userFarm) return {};

  return userFarm;
}

async function fromFieldCrop(fieldCropId) {
  const { location_id } = await knex('fieldCrop').where({ field_crop_id: fieldCropId }).first();
  return fromLocation(location_id);
}

async function fromYield(yieldId) {
  return await knex('yield').where({ yield_id: yieldId }).first();
}

async function fromPrice(priceId) {
  return await knex('price').where({ price_id: priceId }).first();
}

async function fromFarmExpense(farm_expense_id) {
  return await knex('farmExpense').where({ farm_expense_id }).first();
}

async function fromFarmExpenseType(expense_type_id) {
  return await knex('farmExpenseType').where({ expense_type_id }).first();
}

async function fromSale(sale_id) {
  return await knex('sale').where({ sale_id }).first();
}

async function fromOrganicCertifierSurvey(survey_id) {
  return await knex('organicCertifierSurvey').where({ survey_id }).first();
}

function sameFarm(object, farm) {
  return object.farm_id === farm;
}

function notAuthorizedResponse(res) {
  res.status(403).send('user not authorized to access farm');
}
