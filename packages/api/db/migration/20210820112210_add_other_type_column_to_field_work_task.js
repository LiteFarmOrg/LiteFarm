
exports.up = function(knex) {
  return knex.schema.alterTable('field_work_task', (t) => {
    t.string('other_type');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('field_work_task', (t) => {
    t.dropColumn('other_type');
  });
};
