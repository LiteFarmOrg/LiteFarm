exports.up = function (knex) {
  return knex.schema.alterTable('taskType', (t) => {
    t.string('task_translation_key')
  }).then(() => {
    return knex('taskType').select('*').where('farm_id', null)
      .then((data) => {
        return Promise.all(data.map((task) => {
          return knex('taskType').where({ task_id: task.task_id }).update({
            task_translation_key: task.task_name.toUpperCase().replace(/\s/g, '_'),
          })
        }))
      })
  })
};

exports.down = function (knex) {
  return knex.schema.alterTable('taskType', (t) => {
    t.dropColumn('task_translation_key')
  })
};
