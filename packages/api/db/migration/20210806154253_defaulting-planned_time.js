
exports.up = async function(knex) {
  const tasks = await knex('task');
  return Promise.all(tasks.map(({ task_id, due_date }) => {
    return knex('task').update({ planned_time: new Date(due_date) }).where({ task_id });
  }));
};

exports.down = function(knex) {
  return knex('task').update({ planned_time: null });
};
