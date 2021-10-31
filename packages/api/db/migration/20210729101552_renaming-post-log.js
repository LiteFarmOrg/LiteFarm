exports.up = async function(knex) {
  await knex.schema.renameTable('taskType', 'task_type')
  await knex.schema.alterTable('task_type', (t) => {
    t.renameColumn('task_id', 'task_type_id');
  });
  await knex.schema.alterTable('harvestUse', (t) => {
    t.renameColumn('activity_id', 'task_id');
  });
  await knex.schema.alterTable('task', (t) => {
    t.renameColumn('owner', 'owner_user_id');
    t.renameColumn('assignee', 'assignee_user_id');
    t.dropColumn('activity_kind');
    t.dateTime('planned_time')
    t.dateTime('completed_time')
    t.dateTime('late_time')
    t.dateTime('for_review_time')
    t.dateTime('abandoned_time')
    t.dropColumn('status');
  });
  // No match in down function, this was leftover from previous migration.
  await knex.raw('ALTER TABLE field_work_task DROP CONSTRAINT "fieldworkLog_type_check"')
};

exports.down = async function(knex) {
  await knex.schema.renameTable('task_type', 'taskType');
  await knex.schema.alterTable('taskType', (t) => {
    t.renameColumn('task_type_id', 'task_id');
  });
  await knex.schema.alterTable('harvestUse', (t) => {
    t.renameColumn('task_id', 'activity_id');
  });
  await knex.schema.alterTable('task', (t) => {
    t.renameColumn('owner_user_id', 'owner');
    t.renameColumn('assignee_user_id', 'assignee');
    t.enu('activity_kind', ['fertilizing', 'pestControl', 'scouting', 'irrigation', 'harvest', 'seeding', 'fieldWork', 'weatherData', 'soilData', 'other']);
    t.dropColumn('planned_time');
    t.dropColumn('completed_time');
    t.dropColumn('late_time');
    t.dropColumn('for_review_time');
    t.dropColumn('abandoned_time');
    t.enu('status', ['PLANNED', 'LATE', 'FOR_REVIEW', 'COMPLETED', 'ABANDONED']).defaultTo('PLANNED');
  });
};
