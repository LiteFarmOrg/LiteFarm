export const up = async function (knex) {
  await knex.schema.alterTable('harvest_task', function (table) {
    table.renameColumn('quantity_kg', 'quantity');
  });
  await knex.schema.alterTable('harvest_task', function (table) {
    table.decimal('quantity', 36, 12).alter();
    table.enu('quantity_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.boolean('harvest_everything').defaultTo(false);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('harvest_task', function (table) {
    table.renameColumn('quantity', 'quantity_kg');
  });
  await knex.schema.alterTable('harvest_task', function (table) {
    table.float('quantity_kg').alter();
    table.dropColumn('quantity_unit');
    table.dropColumn('harvest_everything');
  });
};
