const { formatAlterTableEnumSql } = require('../util');
const currentEnum = ['soil_amendment', 'pest_control', 'cleaner'];
const newEnum = ['soil_amendment_task', 'pest_control_task', 'cleaning_task'];
exports.up = function(knex) {
  return knex.raw(formatAlterTableEnumSql('product', 'type', newEnum));
};

exports.down = function(knex) {
  return knex.raw(formatAlterTableEnumSql('product', 'type', currentEnum));

};
