export const up = async function (knex) {
  const plantingPlantingManagementPlans = await knex('planting_management_plan')
    .join(
      'crop_management_plan',
      'crop_management_plan.management_plan_id',
      'planting_management_plan.management_plan_id',
    )
    .join(
      'management_plan',
      'management_plan.management_plan_id',
      'planting_management_plan.management_plan_id',
    )
    .where({ is_final_planting_management_plan: true, needs_transplant: true });
  await knex('planting_management_plan')
    .whereIn(
      'planting_management_plan_id',
      plantingPlantingManagementPlans.map(
        ({ planting_management_plan_id }) => planting_management_plan_id,
      ),
    )
    .update({ planting_task_type: 'TRANSPLANT_TASK' });
  const [plantType] = await knex('task_type').where({
    task_name: 'Transplant',
    farm_id: null,
    task_translation_key: 'TRANSPLANT_TASK',
  });
  const { task_type_id } = plantType;
  for (const plantingManagementPlan of plantingPlantingManagementPlans) {
    const planned_time = plantingManagementPlan.transplant_date;
    const [{ task_id }] = await knex('task')
      .insert({
        due_date: planned_time,
        planned_time,
        task_type_id,
        owner_user_id: plantingManagementPlan.created_by_user_id,
        deleted: plantingManagementPlan.deleted,
      })
      .returning('*');
    await knex('transplant_task').insert({
      task_id,
      planting_management_plan_id: plantingManagementPlan.planting_management_plan_id,
    });
  }
};

export const down = async function (knex) {
  const plantTasks = await knex('transplant_task');
  const taskIds = plantTasks.map(({ task_id }) => task_id);
  await knex('transplant_task').delete();
  await knex('task').whereIn('task_id', taskIds).delete();
};
