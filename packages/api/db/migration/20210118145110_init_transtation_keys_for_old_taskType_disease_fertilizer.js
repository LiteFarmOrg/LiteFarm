exports.up = function(knex) {
  return Promise.all([
    knex('fertilizer').whereNull('fertilizer_translation_key')
      .then((data) => {
        return Promise.all(data.map((fertilizer) => {
          return knex('fertilizer').where({ fertilizer_id: fertilizer.fertilizer_id }).update({
            fertilizer_translation_key: fertilizer.fertilizer_type,
          });
        }));
      }),
    knex('disease').whereNull('disease_name_translation_key').orWhereNull('disease_group_translation_key')
      .then((data) => {
        return Promise.all(data.map((disease) => {
          return knex('disease').where({ disease_id: disease.disease_id }).update({
            disease_group_translation_key: disease.disease_group,
            disease_name_translation_key: disease.disease_common_name,
          });
        }));
      }),
    knex('taskType').whereNull('task_translation_key')
      .then((data) => {
        return Promise.all(data.map((taskType) => {
          return knex('taskType').where({ task_id: taskType.task_id }).update({
            task_translation_key: taskType.task_name,
          });
        }));
      }),
  ]);
};

exports.down = function(knex) {

};
