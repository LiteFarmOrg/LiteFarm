
exports.up = function(knex) {
    return Promise.all([
      knex.schema.table('userLog', (table) => {
        table.string('reason_for_log-in_failure').defaultTo('n/a');
      }),
    ])
  };
    
  exports.down = function(knex) {
    return Promise.all([
      knex.schema.table('userLog', (table) => {
        table.dropColumn('reason_for_log-in_failure');
      }),
    ])
  };
  