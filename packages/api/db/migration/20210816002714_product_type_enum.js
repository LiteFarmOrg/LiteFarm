import { formatAlterTableEnumSql } from '../util.js';
const currentEnum = ['soil_amendment', 'pest_control', 'cleaner'];
const newEnum = ['soil_amendment_task', 'pest_control_task', 'cleaning_task'];

export const up = function (knex) {
  return knex.raw(formatAlterTableEnumSql('product', 'type', newEnum));
};

export const down = function (knex) {
  return knex.raw(formatAlterTableEnumSql('product', 'type', currentEnum));
};
