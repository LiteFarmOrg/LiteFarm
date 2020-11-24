
exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('crop', (table) => {
      table.dropUnique(['crop_common_name', 'crop_genus', 'crop_specie']);
      table.unique(['crop_common_name', 'crop_genus', 'crop_specie', 'farm_id']);
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('crop', (table) => {
      table.dropUnique(['crop_common_name', 'crop_genus', 'crop_specie', 'farm_id']);
      table.unique(['crop_common_name', 'crop_genus', 'crop_specie']);
    })
  ]);
};
