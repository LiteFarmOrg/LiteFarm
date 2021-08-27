
exports.up = async function(knex) {
  await knex.schema.alterTable('harvest_task', function(table) {
    table.dropColumn('quantity_kg');
    table.decimal('quantity', 36, 12);
    table.enu('quantity_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.boolean('harvest_everything').defaultTo(false);
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('harvest_task', function(table) {
    table.float('quantity_kg');
    table.dropColumn('quantity');
    table.dropColumn('quantity_unit');
    table.dropColumn('harvest_everything');
  });
};
