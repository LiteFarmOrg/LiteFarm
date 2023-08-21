export const up = async function (knex) {
  const tasksToDelete = await knex.raw(
    'select * from task left join management_tasks mt on task.task_id = mt.task_id left join location_tasks lt on task.task_id = lt.task_id where mt.management_plan_id is null and lt.location_id is null',
  );

  return knex('task')
    .whereIn(
      'task_id',
      tasksToDelete.rows.map((task) => task.task_id),
    )
    .update({ deleted: true });
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
