const { Model } = require('objection');
const knex = Model.knex();
const seededEntities = ['pesticide_id', 'disease_id', 'task_type_id', 'crop_id', 'fertilizer_id'];
const entitiesGetters = {
  fertilizer_id: fromFertilizer,
  management_plan_id: fromManagementPlan,
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
  locations: fromLocations,
  activity_id: fromActivity,
  sale_id: fromSale,
  shift_id: fromShift,
  location_id: fromLocation,
  crop_management_plan: fromCropManagement,
  //TODO remove
  field_id: fromLocation,
  survey_id: fromOrganicCertifierSurvey,
  crop_variety_id: fromCropVariety,
  document_id: fromDocument,
};
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
};

async function fromTask(taskId) {
  return knex('taskType').where({ task_id: taskId }).first();
}

async function fromDocument(document_id) {
  return await knex('document').where({ document_id }).first();
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

async function fromCropManagement(crop_management_plan) {
  const locations = await knex('location').whereIn('location_id', crop_management_plan.planting_management_plans.map(planting_management_plan => planting_management_plan.location_id));
  const farm_id = locations.reduce((farm_id, location) => {
    if (farm_id) {
      return farm_id === location.farm_id ? location.farm_id : undefined;
    } else {
      return location.farm_id;
    }
  }, undefined);
  return { farm_id };
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

async function fromLocations(locations) {
  if (!locations || !locations.length) {
    return {};
  }
  const location_ids = locations ? locations.map((location) => location.location_id) : undefined;
  try {
    const userFarms = await knex('location').join('userFarm', 'location.farm_id', 'userFarm.farm_id')
      .whereIn('location.location_id', location_ids).distinct('location.farm_id');
    if (userFarms.length !== 1) return {};
    return userFarms[0];
  } catch (e) {
    return {};
  }
}

async function fromActivity(req) {
  const user_id = req.user.user_id;
  const { activity_id } = req.params;
  const { farm_id } = req.headers;

  if (req.body.locations) {
    const locations = [];
    let managementPlans;
    for (const location of req.body.locations) {
      if (!location.location_id) {
        return {};
      }
      locations.push(location.location_id);
    }
    if (locations.length === 0) {
      return {};
    }

    if (req.body.crops && req.body.crops.length) {
      managementPlans = [];
      for (const managementPlan of req.body.crops) {
        if (!managementPlan.management_plan_id) {
          return {};
        }
        managementPlans.push(managementPlan.management_plan_id);
      }
    }

    const sameFarm = managementPlans?.length ? await userFarmModel.query()
        .distinct('userFarm.user_id', 'userFarm.farm_id', 'location.location_id', 'location.location_id', 'managementPlan.management_plan_id')
        .join('location', 'userFarm.farm_id', 'location.farm_id')
        .join('managementPlan', 'managementPlan.location_id', 'location.location_id')
        .skipUndefined()
        .whereIn('location.location_id', locations)
        .whereIn('managementPlan.management_plan_id', managementPlans)
        .where('userFarm.user_id', user_id)
        .where('userFarm.farm_id', farm_id) :
      await userFarmModel.query()
        .distinct('userFarm.user_id', 'userFarm.farm_id', 'location.location_id', 'location.location_id')
        .join('location', 'userFarm.farm_id', 'location.farm_id')
        .skipUndefined()
        .whereIn('location.location_id', locations)
        .where('userFarm.user_id', user_id)
        .where('userFarm.farm_id', farm_id);


    if (!sameFarm.length || sameFarm.length < (managementPlans ? managementPlans.length : 0)) {
      return {};
    }
  }
  const userFarm = await userFarmModel.query()
    .distinct('activityLog.activity_id', 'userFarm.user_id', 'userFarm.farm_id', 'location.location_id')
    .join('location', 'userFarm.farm_id', 'location.farm_id')
    .join('activityFields', 'activityFields.location_id', 'location.location_id')
    .join('activityLog', 'activityFields.activity_id', 'activityLog.activity_id')
    .skipUndefined()
    .where('activityLog.activity_id', activity_id)
    .where('userFarm.user_id', user_id)
    .where('userFarm.farm_id', farm_id)
    .first();
  if (!userFarm) return {};

  return userFarm;
}

async function fromManagementPlan(managementPlanId) {
  return await knex('management_plan').where('management_plan_id', managementPlanId).join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id').first();
}

async function fromCropVariety(crop_variety_id) {
  return await knex('crop_variety').where({ crop_variety_id }).first();
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
