export const up = async function (knex) {
  const plantTasks = await knex('plant_task')
    .rightJoin('management_tasks', 'management_tasks.task_id', 'plant_task.task_id')
    .join(
      'planting_management_plan',
      'planting_management_plan.management_plan_id',
      'management_tasks.management_plan_id',
    );
  const bedPlantingManagementPlans = plantTasks.filter(
    ({ planting_method, space_length_cm, space_depth_cm, space_width_cm }) =>
      planting_method === 'BED_METHOD' && (space_length_cm || space_depth_cm || space_width_cm),
  );

  // eslint-disable-next-line no-unused-vars
  const getBedSpacing = ({ space_length_cm, space_width_cm }) => {
    return Number(space_length_cm) / 100;
  };
  for (const bedMethod of bedPlantingManagementPlans) {
    await knex('bed_method')
      .where('planting_management_plan_id', bedMethod.planting_management_plan_id)
      .update({
        planting_depth: Number(bedMethod.space_depth_cm) / 100,
        plant_spacing: getBedSpacing(bedMethod),
      });
  }

  const tasksToDelete = await knex('plant_task');
  const taskIdsToDelete = tasksToDelete.map(({ task_id }) => task_id);
  await knex('plant_task').delete();
  await knex('management_tasks').whereIn('task_id', taskIdsToDelete).delete();
  await knex('task').whereIn('task_id', taskIdsToDelete).delete();

  await knex.schema.alterTable('plant_task', (t) => {
    t.dropColumn('type');
    t.dropColumn('space_depth_cm');
    t.dropColumn('space_length_cm');
    t.dropColumn('space_width_cm');
    t.dropColumn('rate_seeds/m2');
    t.uuid('planting_management_plan_id')
      .references('planting_management_plan_id')
      .inTable('planting_management_plan');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('plant_task', (t) => {
    t.float('space_depth_cm');
    t.float('space_length_cm');
    t.float('space_width_cm');
    t.float('rate_seeds/m2');
    t.enu('type', []);
    t.dropColumn('planting_management_plan_id');
  });
};
