export const up = function (knex) {
  return Promise.all([
    knex('task_type')
      .where({
        task_name: 'Bed Preparation',
        farm_id: null,
        task_translation_key: 'BED_PREPARATION',
      })
      .update({ task_translation_key: 'BED_PREPARATION_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Sales',
        farm_id: null,
        task_translation_key: 'SALES',
      })
      .update({ task_translation_key: 'SALE_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Scouting',
        farm_id: null,
        task_translation_key: 'SCOUTING',
      })
      .update({ task_translation_key: 'SCOUTING_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Harvesting',
        farm_id: null,
        task_translation_key: 'HARVESTING',
      })
      .update({ task_translation_key: 'HARVEST_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Wash and Pack',
        farm_id: null,
        task_translation_key: 'WASH_AND_PACK',
      })
      .update({ task_translation_key: 'WASH_AND_PACK_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Pest Control',
        farm_id: null,
        task_translation_key: 'PEST_CONTROL',
      })
      .update({ task_translation_key: 'PEST_CONTROL_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Other',
        farm_id: null,
        task_translation_key: 'OTHER',
      })
      .update({ task_translation_key: 'OTHER_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Break',
        farm_id: null,
        task_translation_key: 'BREAK',
      })
      .update({ task_translation_key: 'BREAK_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Soil Sample Results',
        farm_id: null,
        task_translation_key: 'SOIL_RESULTS',
      })
      .update({ task_translation_key: 'SOIL_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Irrigation',
        farm_id: null,
        task_translation_key: 'IRRIGATION',
      })
      .update({ task_translation_key: 'IRRIGATION_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Transport',
        farm_id: null,
        task_translation_key: 'TRANSPORT',
      })
      .update({ task_translation_key: 'TRANSPORT_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Field Work',
        farm_id: null,
        task_translation_key: 'FIELD_WORK',
      })
      .update({ task_translation_key: 'FIELD_WORK_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Planting',
        farm_id: null,
        task_translation_key: 'PLANTING',
      })
      .update({ task_translation_key: 'PLANTING_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Social',
        farm_id: null,
        task_translation_key: 'SOCIAL',
      })
      .update({ task_translation_key: 'SOCIAL_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Cleaning',
        farm_id: null,
        task_translation_key: 'CLEANING',
      })
      .update({ task_translation_key: 'CLEANING_TASK' }),
    knex('task_type')
      .where({
        task_name: 'Soil Amendment',
        farm_id: null,
        task_translation_key: 'SOIL_AMENDMENT',
      })
      .update({ task_translation_key: 'SOIL_AMENDMENT_TASK' }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('task_type')
      .where({
        task_name: 'Bed Preparation',
        farm_id: null,
        task_translation_key: 'BED_PREPARATION_TASK',
      })
      .update({ task_translation_key: 'BED_PREPARATION' }),
    knex('task_type')
      .where({
        task_name: 'Sales',
        farm_id: null,
        task_translation_key: 'SALE_TASK',
      })
      .update({ task_translation_key: 'SALES' }),
    knex('task_type')
      .where({
        task_name: 'Scouting',
        farm_id: null,
        task_translation_key: 'SCOUTING_TASK',
      })
      .update({ task_translation_key: 'SCOUTING' }),
    knex('task_type')
      .where({
        task_name: 'Harvesting',
        farm_id: null,
        task_translation_key: 'HARVEST_TASK',
      })
      .update({ task_translation_key: 'HARVESTING' }),
    knex('task_type')
      .where({
        task_name: 'Wash and Pack',
        farm_id: null,
        task_translation_key: 'WASH_AND_PACK_TASK',
      })
      .update({ task_translation_key: 'WASH_AND_PACK' }),
    knex('task_type')
      .where({
        task_name: 'Pest Control',
        farm_id: null,
        task_translation_key: 'PEST_CONTROL_TASK',
      })
      .update({ task_translation_key: 'PEST_CONTROL' }),
    knex('task_type')
      .where({
        task_name: 'Other',
        farm_id: null,
        task_translation_key: 'OTHER_TASK',
      })
      .update({ task_translation_key: 'OTHER' }),
    knex('task_type')
      .where({
        task_name: 'Break',
        farm_id: null,
        task_translation_key: 'BREAK_TASK',
      })
      .update({ task_translation_key: 'BREAK' }),
    knex('task_type')
      .where({
        task_name: 'Soil Sample Results',
        farm_id: null,
        task_translation_key: 'SOIL_TASK',
      })
      .update({ task_translation_key: 'SOIL_RESULTS' }),
    knex('task_type')
      .where({
        task_name: 'Irrigation',
        farm_id: null,
        task_translation_key: 'IRRIGATION_TASK',
      })
      .update({ task_translation_key: 'IRRIGATION' }),
    knex('task_type')
      .where({
        task_name: 'Transport',
        farm_id: null,
        task_translation_key: 'TRANSPORT_TASK',
      })
      .update({ task_translation_key: 'TRANSPORT' }),
    knex('task_type')
      .where({
        task_name: 'Field Work',
        farm_id: null,
        task_translation_key: 'FIELD_WORK_TASK',
      })
      .update({ task_translation_key: 'FIELD_WORK' }),
    knex('task_type')
      .where({
        task_name: 'Planting',
        farm_id: null,
        task_translation_key: 'PLANTING_TASK',
      })
      .update({ task_translation_key: 'PLANTING' }),
    knex('task_type')
      .where({
        task_name: 'Social',
        farm_id: null,
        task_translation_key: 'SOCIAL_TASK',
      })
      .update({ task_translation_key: 'SOCIAL' }),
    knex('task_type')
      .where({
        task_name: 'Cleaning',
        farm_id: null,
        task_translation_key: 'CLEANING_TASK',
      })
      .update({ task_translation_key: 'CLEANING' }),
    knex('task_type')
      .where({
        task_name: 'Soil Amendment',
        farm_id: null,
        task_translation_key: 'SOIL_AMENDMENT_TASK',
      })
      .update({ task_translation_key: 'SOIL_AMENDMENT' }),
  ]);
};
