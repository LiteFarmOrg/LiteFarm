export const up = async function (knex) {
  await knex.schema.renameTable('harvestUse', 'harvest_use');
  await knex.schema.renameTable('harvestUseType', 'harvest_use_type');
  await knex.schema.alterTable('harvest_use', (t) => {
    t.decimal('quantity_kg', 36, 12).alter();
    t.enu('quantity_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
  });
  await knex.schema.alterTable('harvest_use', (t) => {
    t.renameColumn('quantity_kg', 'quantity');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('harvest_use', (t) => {
    t.renameColumn('quantity', 'quantity_kg');
  });
  await knex.schema.alterTable('harvest_use', (t) => {
    t.float('quantity_kg').alter();
    t.dropColumn('quantity_unit');
  });

  await knex.schema.renameTable('harvest_use', 'harvestUse');
  await knex.schema.renameTable('harvest_use_type', 'harvestUseType');
};
