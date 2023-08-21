export const up = async function (knex) {
  const managementPlans = await knex('transplant_task').join(
    'planting_management_plan',
    'planting_management_plan.planting_management_plan_id',
    'transplant_task.planting_management_plan_id',
  );
  for (const { management_plan_id, task_id } of managementPlans) {
    const prevManagementPlan = await knex('plant_task')
      .join(
        'planting_management_plan',
        'planting_management_plan.planting_management_plan_id',
        'plant_task.planting_management_plan_id',
      )
      .where('planting_management_plan.management_plan_id', management_plan_id);
    const prev_planting_management_plan_id =
      prevManagementPlan[0] && prevManagementPlan[0].planting_management_plan_id;
    if (prev_planting_management_plan_id) {
      await knex('transplant_task').where({ task_id }).update({ prev_planting_management_plan_id });
    }
  }
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
