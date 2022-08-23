import { formatAlterTableEnumSql } from '../util.js';
const allUnits = ['g', 'lb', 'kg', 't', 'mt', 'oz', 'l', 'gal', 'ml', 'fl-oz'];
const currentUnits = ['g', 'lb', 'kg', 'oz', 'l', 'gal', 'ml'];

export const up = async function (knex) {
  await knex.raw(formatAlterTableEnumSql('pest_control_task', 'amount_unit', allUnits));
  await knex.raw(formatAlterTableEnumSql('soil_amendment_task', 'amount_unit', allUnits));
  await knex.schema.alterTable('soil_amendment_task', (t) => {
    t.renameColumn('amount', 'product_quantity');
    t.renameColumn('amount_unit', 'product_quantity_unit');
  });
  await knex.schema.alterTable('pest_control_task', (t) => {
    t.renameColumn('amount', 'product_quantity');
    t.renameColumn('amount_unit', 'product_quantity_unit');
  });
  await knex.raw(
    'ALTER TABLE soil_amendment_task ALTER COLUMN product_quantity TYPE NUMERIC(36,12)',
  );
  await knex.raw('ALTER TABLE pest_control_task ALTER COLUMN product_quantity TYPE NUMERIC(36,12)');
  await knex.raw('ALTER TABLE pest_control_task ALTER COLUMN product_quantity DROP NOT NULL');
  await knex.raw(
    `ALTER TABLE pest_control_task ALTER COLUMN product_quantity_unit SET DEFAULT 'l'`,
  );
};

export const down = async function (knex) {
  await knex.schema.alterTable('soil_amendment_task', (t) => {
    t.renameColumn('product_quantity', 'amount');
    t.renameColumn('product_quantity_unit', 'amount_unit');
  });
  await knex.schema.alterTable('pest_control_task', (t) => {
    t.renameColumn('product_quantity', 'amount');
    t.renameColumn('product_quantity_unit', 'amount_unit');
  });
  await knex.raw('ALTER TABLE soil_amendment_task ALTER COLUMN amount TYPE DOUBLE');
  await knex.raw('ALTER TABLE pest_control_task ALTER COLUMN amount TYPE DOUBLE');
  await knex.raw(formatAlterTableEnumSql('pest_control_task', 'amount_unit', currentUnits));
  await knex.raw(formatAlterTableEnumSql('soil_amendment_task', 'amount_unit', currentUnits));
  await knex.raw(`ALTER TABLE pest_control_task ALTER COLUMN amount_unit SET DEFAULT 'kg'`);
};
