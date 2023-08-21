export const up = async function (knex) {
  await knex.schema.alterTable('harvest_task', function (table) {
    table.renameColumn('quantity', 'projected_quantity');
    table.renameColumn('quantity_unit', 'projected_quantity_unit');
    table.decimal('actual_quantity', 36, 12);
    table.enu('actual_quantity_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('harvest_task', function (table) {
    table.renameColumn('projected_quantity', 'quantity');
    table.renameColumn('projected_quantity_unit', 'quantity_unit');
    table.dropColumn('actual_quantity');
    table.dropColumn('actual_quantity_unit');
  });
};
