exports.up = function (knex) {
  return knex('task_type').update({
    task_name: 'Soil Amendment',
    task_translation_key: 'SOIL_AMENDMENT',
  }).where({ task_translation_key: 'FERTILIZING' });
};

exports.down = function (knex) {
  return knex('task_type').update({
    task_name: 'Fertilizing',
    task_translation_key: 'FERTILIZING',
  }).where({ task_translation_key: 'SOIL_AMENDMENT' });
};
