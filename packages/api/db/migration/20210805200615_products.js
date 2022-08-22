import { formatAlterTableEnumSql } from '../util.js';

export const up = async function (knex) {
  await knex.schema.createTable('product', (t) => {
    t.increments('product_id');
    t.string('name').notNullable();
    t.string('product_translation_key');
    t.string('supplier');
    t.boolean('on_permitted_substances_list');
    t.enu('type', ['soil_amendment', 'pest_control', 'cleaner']);
    t.uuid('farm_id').references('farm_id').inTable('farm');
    t.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
    t.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
    t.boolean('deleted').defaultTo(false);
    t.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    t.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
  });
  await knex.raw('ALTER TABLE fertilizer_task DROP CONSTRAINT fertilizerlog_fertilizer_id_foreign');
  await knex.schema.renameTable('fertilizer_task', 'soil_amendment_task');
  await knex.schema.alterTable('soil_amendment_task', (t) => {
    t.renameColumn('fertilizer_id', 'historic_product_id');
    t.renameColumn('quantity_kg', 'amount');
    t.enu('amount_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal', 'ml']).defaultTo('kg');
    t.enu('purpose', ['structure', 'moisture_retention', 'nutrient_availability', 'ph', 'other']);
    t.string('other_purpose');
    t.integer('product_id').references('product_id').inTable('product');
  });
  await knex.raw(
    'ALTER TABLE pest_control_task DROP CONSTRAINT pestcontrollog_target_disease_id_foreign',
  );
  await knex.raw(
    'ALTER TABLE pest_control_task DROP CONSTRAINT pestcontrollog_pesticide_id_foreign',
  );
  await knex.raw(
    formatAlterTableEnumSql('pest_control_task', 'type', [
      'systemicSpray',
      'foliarSpray',
      'handPick',
      'biologicalControl',
      'burning',
      'soilFumigation',
      'heatTreatment',
      'flameWeeding',
      'mulching',
      'pruning',
      'traps',
      'other',
    ]),
  );
  await knex.schema.alterTable('pest_control_task', (t) => {
    t.dropColumn('target_disease_id');
    t.renameColumn('pesticide_id', 'historic_product_id');
    t.integer('product_id').references('product_id').inTable('product');
    t.string('pest_target');
    t.renameColumn('type', 'control_method');
    t.string('other_method');
    t.renameColumn('quantity_kg', 'amount');
    t.enu('amount_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal', 'ml']).defaultTo('kg');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('pest_control_task', (t) => {
    t.dropColumn('on_permitted_substances_list');
    t.dropColumn('amount_unit');
    t.dropColumn('amount');
    t.dropColumn('supplier');
    t.dropColumn('other_method');
    t.renameColumn('control_method', 'type');
    t.dropColumn('pest_target');
    t.dropForeign(['product_id']);
    t.dropColumn('product_id');
    t.integer('pesticide_id').references('pesticide_id').inTable('pesticide');
    t.integer('target_disease_id').references('disease_id').inTable('disease');
  });
  await knex.raw(
    formatAlterTableEnumSql('pest_control_task', 'type', [
      'systemicSpray',
      'foliarSpray',
      'handPick',
      'biologicalControl',
      'burning',
      'soilFumigation',
      'heatTreatment',
    ]),
  );
  await knex.schema.renameTable('soil_amendment_task', 'fertilizer_task');
  await knex.schema.alterTable('fertilizer_task', (t) => {
    t.dropForeign(['product_id']);
    t.dropColumn('product_id');
    t.integer('fertilizer_id').references('fertilizer_id').inTable('fertilizer');
  });
  await knex.schema.dropTable('product');
};
