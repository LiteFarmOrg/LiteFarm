const { formatAlterTableEnumSql } = require('../util');
const logTypeToTaskId = {
  fertilizing: 6,
  pestControl: 11,
  scouting: 7,
  irrigation: null,
  harvest: 8,
  seeding: 5,
  fieldWork: 1,
  weatherData: 12,
  soilData: null,
  other: 12
}
const oldFieldWorkTypes = ['plow', 'ridgeTill', 'zoneTill', 'mulchTill', 'ripping', 'discing'];
const fieldWorkTypes = [ ...oldFieldWorkTypes, 'bedPreparation', 'coverRow', 'irrigationSetup', 'prune', 'weed'];
const moodToHappiness = { 'happy': 4, 'neutral': 3, 'very happy': 5, 'sad': 2, 'very sad': 1, 'na': 0, 'no answer': 0 };
const shiftTaskToTaskTable = {
  1: 'field_work_task',
  2: 'transport_task',
  3: 'sale_task',
  4: 'social_task',
  5: 'plant_task',
  6: 'fertilizer_task',
  7: 'scouting_task',
  8: 'harvest_task',
  9: 'field_work_task',
  10: 'wash_and_pack_task',
  11: 'pest_control_task',
};
const newTableNames = {
  fieldWorkLog: 'field_work_task',
  irrigationLog: 'irrigation_task',
  scoutingLog: 'scouting_task',
  seedLog: 'plant_task',
  fertilizerLog: 'fertilizer_task',
  pestControlLog: 'pest_control_task',
  harvestLog: 'harvest_task',
  soilDataLog: 'soil_task',
  activityFields: 'location_tasks',
  activityCrops: 'management_tasks',
}
exports.up = async function(knex) {
  // Modifying task types to fit new task structure
  await knex('taskType').insert({ task_id: 1000000, task_name: 'AUG_20201_MIGRATION_PLACEHOLDER' });
  await knex('taskType').insert({  task_name: 'Sales', task_translation_key: 'SALES' });
  const [soil] = await knex('taskType').insert({  task_name: 'Soil Sample Results', task_translation_key: 'SOIL_RESULTS' }).returning('task_id');
  const [irrigation] = await knex('taskType').insert({  task_name: 'Irrigation', task_translation_key: 'IRRIGATION' }).returning('task_id');
  await knex('taskType').update({  task_name: 'Transport', task_translation_key: 'TRANSPORT' }).where({ task_id: 2 });
  await knex('taskType').update({ task_name: 'Field Work', task_translation_key: 'FIELD_WORK' }).where({ task_id: 9 }); // Weeding -> Field Work
  await knex('taskType').update({ task_name: 'Planting', task_translation_key: 'PLANTING' }).where({ task_id: 5 });
  await knex('taskType').update({ task_name: 'Social', task_translation_key: 'SOCIAL' }).where({ task_id: 4 });
  // Restructure logs -> tasks
  await knex.schema.renameTable('activityLog', 'task');
  await knex.schema.alterTable('task', (t) => {
    t.renameColumn('activity_id', 'task_id');
    t.renameColumn('date', 'due_date');
    t.integer('type').references('task_id').inTable('taskType').defaultTo(1000000);
    t.enu('status', ['PLANNED', 'LATE', 'FOR_REVIEW', 'COMPLETED', 'ABANDONED']).defaultTo('PLANNED');
    t.renameColumn('user_id', 'owner');
    t.string('assignee').references('user_id').inTable('users');
    t.jsonb('coordinates');
    t.float('duration');
    t.float('wage_at_moment');
    t.integer('happiness').unsigned();
    t.text('completion_notes');
  });
  Object.keys(newTableNames).map(async (k) => {
    await renameActivityChildTable(knex, k, newTableNames[k]);
  });
  await knex.raw(
    formatAlterTableEnumSql('field_work_task', 'type', fieldWorkTypes),
  );
  await knex.schema.createTable('maintenance_task', (t) => {
    t.integer('task_id').references('task_id').inTable('task').primary();
    t.enu('type', ['CHECK_IRRIGATION_LINES', 'FIX_EQUIPMENT', 'FIX_FENCE', 'OIL_CHANGE', 'PAINT', 'SHARPEN_TOOL'])
  });
  await knex.schema.createTable('transplant_task', (t) => {
    t.integer('task_id').references('task_id').inTable('task').primary();
  });
  await knex.schema.createTable('social_task', (t) => {
    t.enu('type', ['MEETING', 'TRAIN  ING', 'CEREMONY'])
    t.integer('task_id').references('task_id').inTable('task').primary();
  });
  await knex.schema.createTable('transport_task', (t) => {
    t.integer('task_id').references('task_id').inTable('task').primary();
  });
  await knex.schema.createTable('sale_task', (t) => {
    t.integer('task_id').references('task_id').inTable('task').primary();
  });
  await knex.schema.createTable('wash_and_pack_task', (t) => {
    t.integer('task_id').references('task_id').inTable('task').primary();
  });
  // Updating task "type" to match activityKind
  logTypeToTaskId.soilData = soil;
  logTypeToTaskId.irrigation = irrigation;
  Object.keys(logTypeToTaskId).map(async (k) => {
    await logTypeUpdate(knex, k, logTypeToTaskId[k]);
  });

  // Shift && shifTask to task migration.
  const shiftTasks = await knex('shift').join('shiftTask', 'shift.shift_id', 'shiftTask.shift_id');
  shiftTasks.map(async ({ mood, created_by_user_id,  user_id, task_id, duration, wage_at_moment, shift_date, management_plan_id, location_id }) => {
    const happiness = moodToHappiness[mood];
    const owner = created_by_user_id  ;
    const assignee  = user_id;
    const type = task_id === 1 ? 9 : task_id;
    const due_date = shift_date;
    const [resultingTask] =  await knex('task').insert({ happiness, owner, assignee, type, due_date, duration, wage_at_moment }).returning('*');
    location_id !== null ? await knex('location_tasks').insert({ task_id: resultingTask.task_id, location_id }):
      await knex('management_tasks').insert({ task_id: resultingTask.task_id, management_plan_id  });
    task_id < 11? await  knex(shiftTaskToTaskTable[task_id]).insert({ task_id: resultingTask.task_id }) :
      task_id === 11 ? await knex(shiftTaskToTaskTable[task_id]).insert({ task_id: resultingTask.task_id, quantity_kg: 0, type: 'systemicSpray' }) : null;
  });
  await knex('task').update({ status: 'COMPLETED' });
};

exports.down = async function(knex) {
  await knex('taskType').where('task_id', 1000000).del();
  await knex('taskType').whereIn('task_name', ['Sales', 'Irrigation']).del();
  await knex('taskType').update({  task_name: 'Delivery', task_translation_key: 'DELIVERY' }).where({ task_id: 2 });
  await knex('taskType').update({ task_name: 'Weeding', task_translation_key: 'WEEDING' }).where({ task_id: 9 }); // Weeding -> Field Work
  await knex('taskType').update({ task_name: 'Seeding', task_translation_key: 'SEEDING' }).where({ task_id: 5 });
  await knex('taskType').update({ task_name: 'Social', task_translation_key: 'SOCIAL' }).where({ task_id: 4 });
  await knex.schema.renameTable('task', 'activityLog');
  await knex.schema.alterTable('activityLog', (t) => {
    t.renameColumn('task_id', 'activity_id');
    t.renameColumn('due_date', 'date');
    t.dropColumn('type');
    t.dropColumn('status');
    t.renameColumn('owner', 'user_id');
    t.dropColumn('assignee');
    t.dropColumn('coordinates');
    t.dropColumn('duration');
    t.dropColumn('wage_at_moment');
    t.dropColumn('happiness');
    t.dropColumn('notes');
    t.dropColumn('completion_notes');
  });
  Object.keys(newTableNames).map(async (k) => {
    await renameTaskChildTable(knex, newTableNames[k], k);
  });
  await knex.raw(
    formatAlterTableEnumSql('field_work_task', 'type', oldFieldWorkTypes),
  );
  await knex.schema.dropTable('maintenance_task');
  await knex.schema.dropTable('transplant_task');
  await knex.schema.dropTable('social_task');
  await knex.schema.dropTable('transport_task');
  await knex.schema.dropTable('sale_task');
  await knex.schema.dropTable('wash_and_pack_task');
};


async function renameActivityChildTable(knex, oldName, newName) {
  await knex.schema.renameTable(oldName, newName);
  await knex.schema.alterTable(newName, (t) => {
    t.renameColumn('activity_id', 'task_id')
  });
}
async function renameTaskChildTable(knex, oldName, newName) {
  await knex.schema.renameTable(oldName, newName);
  await knex.schema.alterTable(newName, (t) => {
    t.renameColumn('task_id', 'activity_id')
  });
}

async function logTypeUpdate(knex, logType, taskId) {
  await knex('task').where({ activity_kind: logType }).update({ type: taskId });
}
