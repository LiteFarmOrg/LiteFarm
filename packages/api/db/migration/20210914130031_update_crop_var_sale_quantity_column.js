
exports.up = async function(knex) {
  await knex.schema.alterTable('crop_variety_sale', function (table) {
    table.renameColumn('quantity_kg', 'quantity');
    table.enu('quantity_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('crop_variety_sale', function (table) {
    table.renameColumn('quantity', 'quantity_kg');
    table.dropColumn('quantity_unit');
  });
};
