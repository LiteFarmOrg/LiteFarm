export const up = async function (knex) {
  const deletedPlans = await knex('management_plan').where({ deleted: true });
  await knex('management_tasks')
    .whereIn(
      'management_plan_id',
      deletedPlans.map(({ management_plan_id }) => management_plan_id),
    )
    .delete();
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
