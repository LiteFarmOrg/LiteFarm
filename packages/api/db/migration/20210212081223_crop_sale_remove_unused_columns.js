
exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('cropSale', (table) => {
      table.dropForeign('field_crop_id');
      table.dropColumn('field_crop_id');
      table.dropColumn('farm_id');
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('cropSale', (table) => {
      table.integer('field_crop_id')
        .references('field_crop_id')
        .inTable('fieldCrop').onDelete('CASCADE');
      table.uuid('farm_id');
    }),
  ]);
};
