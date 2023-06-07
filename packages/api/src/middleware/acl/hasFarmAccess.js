import knex from '../../util/knex.js';
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
  locationIds: fromLocationIds,
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
  default_initial_location_id: fromLocation,
  task_id: fromTaskId,
  taskManagementPlanAndLocation: fromTaskManagementPlanAndLocation,
  nomination_id: fromNomination,
  transplant_task: fromTransPlantTask,
};
import userFarmModel from '../../models/userFarmModel.js';

export default ({ params = null, body = null, mixed = null }) => async (req, res, next) => {
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
      //TODO: remove and fix hasFarmAccess on post harvest_tasks middleware. LF-1969
      id = req.body[0][id_name];
    } else {
      id = req.body[id_name];
    }
  }
  if (!id_name) {
    return next();
  }

  const { farm_id } = req.headers;
  try {
    const farmIdObjectFromEntity = await entitiesGetters[id_name](id, next);
    // Is getting a seeded table and accessing community data. Go through.
    if (
      seededEntities.includes(id_name) &&
      req.method === 'GET' &&
      farmIdObjectFromEntity.farm_id === null
    ) {
      return next();
    } else if (farmIdObjectFromEntity?.next) {
      return next();
    }
    return sameFarm(farmIdObjectFromEntity, farm_id) ? next() : notAuthorizedResponse(res);
  } catch (e) {
    notAuthorizedResponse(res);
  }
};

async function fromTaskId(task_id) {
  const taskType = await knex('task')
    .join('task_type', 'task.task_type_id', 'task_type.task_type_id')
    .where({ task_id })
    .first();
  //TODO: planting transplant task authorization test
  if (['PLANT_TASK', 'TRANSPLANT_TASK'].includes(taskType?.task_translation_key)) {
    const task_type = taskType.task_translation_key.toLowerCase();
    return await knex('task')
      .join(task_type, `${task_type}.task_id`, 'task.task_id')
      .join(
        'planting_management_plan',
        'planting_management_plan.planting_management_plan_id',
        `${task_type}.planting_management_plan_id`,
      )
      .join(
        'management_plan',
        'management_plan.management_plan_id',
        'planting_management_plan.management_plan_id',
      )
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .where('task.task_id', task_id)
      .first();
  }
  const cropVariety = await knex('crop_variety')
    .distinct('crop_variety.farm_id')
    .join('management_plan', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
    .join(
      'planting_management_plan',
      'management_plan.management_plan_id',
      'planting_management_plan.management_plan_id',
    )
    .join(
      'management_tasks',
      'management_tasks.planting_management_plan_id',
      'planting_management_plan.planting_management_plan_id',
    )
    .where('management_tasks.task_id', task_id)
    .first();

  const userFarm = await userFarmModel
    .query()
    .distinct(
      'location_tasks.task_id',
      'userFarm.user_id',
      'userFarm.farm_id',
      'location.location_id',
    )
    .join('location', 'userFarm.farm_id', 'location.farm_id')
    .join('location_tasks', 'location_tasks.location_id', 'location.location_id')
    .skipUndefined()
    .where('location_tasks.task_id', task_id)
    .first();

  if (!userFarm && !cropVariety) return {};
  return userFarm || cropVariety;
}

function fromTask(taskTypeId) {
  return knex('task_type').where({ task_type_id: taskTypeId }).first();
}

function fromDocument(document_id) {
  return knex('document').where({ document_id }).first();
}

function fromShift(shiftId) {
  return knex('shift').where({ shift_id: shiftId }).first();
}

function fromPesticide(pesticideId) {
  return knex('pesticide').where({ pesticide_id: pesticideId }).first();
}

function fromNitrogenSchedule(nitrogenScheduleId) {
  return knex('nitrogenSchedule').where({ nitrogen_schedule_id: nitrogenScheduleId }).first();
}

async function fromCropManagement(crop_management_plan, next) {
  const locationIds = crop_management_plan.planting_management_plans
    .map((planting_management_plan) => planting_management_plan.location_id)
    .filter((location_id) => location_id);
  const hasLocationId = locationIds.length;
  //TODO: find a proper way by pass farm id check
  if (!hasLocationId) return { next: true };
  const locations = await knex('location').whereIn('location_id', locationIds);
  const farm_id = locations.reduce((farm_id, location) => {
    if (farm_id) {
      return farm_id === location.farm_id ? location.farm_id : undefined;
    } else {
      return location.farm_id;
    }
  }, undefined);
  return { farm_id };
}

function fromDisease(disease_id) {
  return knex('disease').where({ disease_id }).first();
}

function fromLocation(location_id) {
  return knex('location').where({ location_id }).first();
}

function fromCrop(cropId) {
  return knex('crop').where({ crop_id: cropId }).first();
}

function fromFertilizer(fertilizerId) {
  return knex('fertilizer').where({ fertilizer_id: fertilizerId }).first();
}

function fromNomination(nominationId) {
  return knex('nomination').where({ nomination_id: nominationId }).first();
}

async function fromLocations(locations) {
  if (!locations || !locations.length) {
    return {};
  }
  const location_ids = locations ? locations.map((location) => location.location_id) : undefined;
  try {
    const userFarms = await knex('location')
      .join('userFarm', 'location.farm_id', 'userFarm.farm_id')
      .whereIn('location.location_id', location_ids)
      .distinct('location.farm_id');
    if (userFarms.length !== 1) return {};
    return userFarms[0];
  } catch (e) {
    return {};
  }
}

async function fromLocationIds(location_ids) {
  if (!location_ids || !location_ids.length) {
    return {};
  }
  try {
    const userFarms = await knex('location')
      .join('userFarm', 'location.farm_id', 'userFarm.farm_id')
      .whereIn('location.location_id', location_ids)
      .distinct('location.farm_id');
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

    const sameFarm = managementPlans?.length
      ? await userFarmModel
          .query()
          .distinct(
            'userFarm.user_id',
            'userFarm.farm_id',
            'location.location_id',
            'location.location_id',
            'managementPlan.management_plan_id',
          )
          .join('location', 'userFarm.farm_id', 'location.farm_id')
          .join('managementPlan', 'managementPlan.location_id', 'location.location_id')
          .skipUndefined()
          .whereIn('location.location_id', locations)
          .whereIn('managementPlan.management_plan_id', managementPlans)
          .where('userFarm.user_id', user_id)
          .where('userFarm.farm_id', farm_id)
      : await userFarmModel
          .query()
          .distinct(
            'userFarm.user_id',
            'userFarm.farm_id',
            'location.location_id',
            'location.location_id',
          )
          .join('location', 'userFarm.farm_id', 'location.farm_id')
          .skipUndefined()
          .whereIn('location.location_id', locations)
          .where('userFarm.user_id', user_id)
          .where('userFarm.farm_id', farm_id);

    if (!sameFarm.length || sameFarm.length < (managementPlans ? managementPlans.length : 0)) {
      return {};
    }
  }
  const userFarm = await userFarmModel
    .query()
    .distinct(
      'activityLog.activity_id',
      'userFarm.user_id',
      'userFarm.farm_id',
      'location.location_id',
    )
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

function fromManagementPlan(managementPlanId) {
  return knex('management_plan')
    .where('management_plan_id', managementPlanId)
    .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
    .first();
}

function fromCropVariety(crop_variety_id) {
  return knex('crop_variety').where({ crop_variety_id }).first();
}

function fromYield(yieldId) {
  return knex('yield').where({ yield_id: yieldId }).first();
}

function fromPrice(priceId) {
  return knex('price').where({ price_id: priceId }).first();
}

function fromFarmExpense(farm_expense_id) {
  return knex('farmExpense').where({ farm_expense_id }).first();
}

function fromFarmExpenseType(expense_type_id) {
  return knex('farmExpenseType').where({ expense_type_id }).first();
}

function fromSale(sale_id) {
  return knex('sale').where({ sale_id }).first();
}

function fromOrganicCertifierSurvey(survey_id) {
  return knex('organicCertifierSurvey').where({ survey_id }).first();
}

function sameFarm(object, farm) {
  return object.farm_id === farm;
}

function notAuthorizedResponse(res) {
  res.status(403).send('user not authorized to access farm');
}

async function fromTaskManagementPlanAndLocation(req) {
  const farm_id = req.headers.farm_id;
  // harvest_tasks POST request body is an array
  const tasks = req.body.length ? req.body : [req.body];
  const locationIds = new Set();
  for (const { managementPlans, locations } of tasks) {
    locations.forEach(({ location_id }) => locationIds.add(location_id));

    for (const { planting_management_plan_id } of managementPlans || []) {
      const managementPlan = await knex('management_plan')
        .join(
          'planting_management_plan',
          'planting_management_plan.management_plan_id',
          'management_plan.management_plan_id',
        )
        .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
        .where('planting_management_plan.planting_management_plan_id', planting_management_plan_id)
        .first();
      if (managementPlan.farm_id !== farm_id) return {};

      locationIds.add(managementPlan.location_id);
    }
  }
  const farmIds = await knex('location')
    .whereIn('location_id', [...locationIds])
    .pluck('farm_id');

  if (
    farmIds.length !== locationIds.size || // check if all locationIds exist in the DB
    new Set(farmIds).size !== 1 ||
    farmIds[0] !== farm_id
  ) {
    return {};
  }

  return { farm_id };
}

async function fromTransPlantTask(req) {
  const { farm_id } = req.headers;
  const { planting_management_plan, prev_planting_management_plan_id } = req.body.transplant_task;

  const { location_id, management_plan_id } = planting_management_plan;

  const prevManagementPlan = await knex('management_plan')
    .join(
      'planting_management_plan',
      'planting_management_plan.management_plan_id',
      'management_plan.management_plan_id',
    )
    .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
    .where('planting_management_plan.planting_management_plan_id', prev_planting_management_plan_id)
    .first();

  const managementPlan = await knex('management_plan')
    .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
    .where('management_plan.management_plan_id', management_plan_id)
    .first();

  for (const plan of [managementPlan, prevManagementPlan]) {
    if (plan.farm_id !== farm_id) return {};
  }

  const locationIds = [location_id, prevManagementPlan.location_id].reduce((acc, id) => {
    if (id) {
      acc.add(id);
    }
    return acc;
  }, new Set());

  const farmIds = await knex('location')
    .whereIn('location_id', [...locationIds])
    .pluck('farm_id');

  if (
    farmIds.length !== locationIds.size || // check if all locationIds exist in the DB
    new Set(farmIds).size !== 1 ||
    farmIds[0] !== farm_id
  ) {
    return {};
  }

  return { farm_id };
}
