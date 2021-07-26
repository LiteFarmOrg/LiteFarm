
exports.up = async function(knex) {
  await knex.schema.renameTable('activityLog', 'task');
  await knex.schema.createTable('task', (t) => {
    t.uuid('task_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    t.integer('type').references('task_id').inTable('taskType');
    t.enu('status', ['PLANNED', 'LATE', 'FOR_REVIEW', 'COMPLETED', 'ABANDONED']).defaultTo('PLANNED');
    t.uuid('owner').references('user_id').inTable('users');
    t.uuid('assignee').references('user_id').inTable('users');
    t.jsonb('coordinates');
    t.integer('happiness').unsigned();
    t.text('notes');
    t.text('completion_notes');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('task');
};
