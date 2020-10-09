
exports.up = function(knex) {
  return  knex.schema.alterTable('shiftTask', (table) => {
    table.boolean('deleted').defaultTo(false)
  })
};

exports.down = function(knex) {
  return  knex.schema.alterTable('shiftTask', (table) => {
    table.dropColumn('deleted')
  })
};
