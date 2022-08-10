export const up = function (knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.enu('status', ['ACTIVE', 'PLANNED', 'COMPLETED', 'ABANDONED']).defaultTo('PLANNED');
    t.date('abandoned_date');
    t.date('completed_date');
    t.date('start_date');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.dropColumn('status');
    t.dropColumn('abandoned_date');
    t.dropColumn('completed_date');
    t.dropColumn('start_date');
  });
};
