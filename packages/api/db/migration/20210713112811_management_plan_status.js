exports.up = function(knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.enu('status', ['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).defaultTo('IN_PROGRESS');
    t.date('abandoned_date');
    t.date('completed_date');
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.dropColumn('status');
    t.dropColumn('abandoned_date');
    t.dropColumn('completed_date');
  });
};
