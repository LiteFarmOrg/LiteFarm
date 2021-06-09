
exports.up = function(knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.string('name');
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.dropColumn('name');
  })
};
