exports.up = function (knex) {
  return knex('task_type').update({
    task_name: 'Soil Amendment',
    task_translation_key: 'SOIL_AMENDMENT',
  }).where({ task_translation_key: 'FERTILIZING' })
    .orWhere({ task_translation_key: 'Fertilizing' });
};

exports.down = function (knex) {
  return knex('task_type').update({
    task_name: 'Fertilizing',
    task_translation_key: 'FERTILIZING',
  }).where({ task_translation_key: 'SOIL_AMENDMENT' });
};
