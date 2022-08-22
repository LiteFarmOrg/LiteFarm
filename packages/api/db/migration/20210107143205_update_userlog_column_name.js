export const up = function (knex) {
  return Promise.all([
    knex.schema.table('userLog', (table) => {
      table.renameColumn('reason_for_log-in_failure', 'reason_for_failure');
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.schema.table('userLog', (table) => {
      table.dropColumn('reason_for_failure');
    }),
  ]);
};
