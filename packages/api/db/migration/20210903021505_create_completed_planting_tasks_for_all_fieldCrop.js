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
    .where({ is_final_planting_management_plan: false, already_in_ground: false })
    .orWhere({
      needs_transplant: false,
      already_in_ground: false,
    });
  await knex('planting_management_plan')
    .whereIn(
      'planting_management_plan_id',
      plantingPlantingManagementPlans.map(
        ({ planting_management_plan_id }) => planting_management_plan_id,
      ),
    )
    .update({ planting_task_type: 'PLANT_TASK' });
  const [plantType] = await knex('task_type').where({
    task_name: 'Planting',
    farm_id: null,
    task_translation_key: 'PLANT_TASK',
  });
  if (plantType) {
    const { task_type_id } = plantType;
    for (const plantingManagementPlan of plantingPlantingManagementPlans) {
      const planned_time = plantingManagementPlan.plant_date || plantingManagementPlan.seed_date;
      const [{ task_id }] = await knex('task')
        .insert({
          due_date: planned_time,
          planned_time,
          task_type_id,
          owner_user_id: plantingManagementPlan.created_by_user_id,
          completed_time: knex.fn.now(),
          deleted: plantingManagementPlan.deleted,
        })
        .returning('*');
      await knex('plant_task').insert({
        task_id,
        planting_management_plan_id: plantingManagementPlan.planting_management_plan_id,
      });
    }
  }
};

export const down = async function (knex) {
  const plantTasks = await knex('plant_task');
  const taskIds = plantTasks.map(({ task_id }) => task_id);
  await knex('plant_task').delete();
  await knex('task').whereIn('task_id', taskIds).delete();
};
