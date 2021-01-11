
exports.up = function(knex) {
    return Promise.all([
      knex.schema.table('userLog', (table) => {
        table.renameColumn('reason_for_log-in_failure', 'reason_for_failure');
      }),
    ])
  };
    
  exports.down = function(knex) {
    return Promise.all([
      knex.schema.table('userLog', (table) => {
        table.dropColumn('reason_for_failure');
      }),
    ])
  };
  