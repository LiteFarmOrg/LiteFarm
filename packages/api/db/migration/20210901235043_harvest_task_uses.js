
exports.up = async function (knex) {
  await knex.schema.alterTable('harvest_task', function (table) {
    table.renameColumn('quantity', 'projected_quantity');
    table.renameColumn('quantity_unit', 'projected_quantity_unit');
    table.decimal('actual_quantity', 36, 12);
    table.enu('actual_quantity_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.decimal('not_sure', 36, 12);
    table.enu('not_sure_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.decimal('sales', 36, 12);
    table.enu('sales_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.decimal('self_consumption', 36, 12);
    table.enu('self_consumption_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.decimal('animal_feed', 36, 12);
    table.enu('animal_feed_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.decimal('compost', 36, 12);
    table.enu('compost_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.decimal('gift', 36, 12);
    table.enu('gift_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.decimal('exchange', 36, 12);
    table.enu('exchange_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.decimal('saved_for_seed', 36, 12);
    table.enu('saved_for_seed_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
    table.decimal('other', 36, 12);
    table.enu('other_unit', ['kg', 'mt', 'lb', 't']).defaultTo('kg');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('harvest_task', function (table) {
    table.renameColumn('projected_quantity', 'quantity');
    table.renameColumn('projected_quantity_unit', 'quantity_unit');
    table.dropColumn('actual_quantity');
    table.dropColumn('actual_quantity_unit');
    table.dropColumn('not_sure');
    table.dropColumn('not_sure_unit');
    table.dropColumn('sales');
    table.dropColumn('sales_unit');
    table.dropColumn('self_consumption');
    table.dropColumn('self_consumption_unit');
    table.dropColumn('animal_feed');
    table.dropColumn('animal_feed_unit');
    table.dropColumn('compost');
    table.dropColumn('compost_unit');
    table.dropColumn('gift');
    table.dropColumn('gift_unit');
    table.dropColumn('exchange');
    table.dropColumn('exchange_unit');
    table.dropColumn('saved_for_seed');
    table.dropColumn('saved_for_seed_unit');
    table.dropColumn('other');
    table.dropColumn('other_unit');
  });
};