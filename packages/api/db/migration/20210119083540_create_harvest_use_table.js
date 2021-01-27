exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('harvestUse', function (table) {
      table.increments('harvest_use_id').primary();
      table.integer('activity_id')
        .references('activity_id')
        .inTable('harvestLog').notNullable()
        .onDelete('CASCADE');
      table.integer('harvest_use_type_id')
        .references('harvest_use_type_id')
        .inTable('harvestUseType').notNullable()
        .onDelete('CASCADE');
      table.float('quantity_kg');
      table.unique([ 'activity_id', 'harvest_use_type_id' ]);
    }),
  ]);

};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable('harvestUse'),
  ]);

};
