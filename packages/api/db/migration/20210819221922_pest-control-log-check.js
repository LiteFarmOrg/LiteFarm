
exports.up = function(knex) {
  return knex.raw('ALTER TABLE pest_control_task DROP CONSTRAINT "pestControlLog_type_check"')
};

exports.down = function(knex) {
  /* OC:
    There is already a pest control check that is enforced, this was not dropped on the pest-soil
    because of the table name change from pestControlLog to -> pest_control_task
  \*/
};
