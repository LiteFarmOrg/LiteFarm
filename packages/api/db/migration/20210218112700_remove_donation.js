
exports.up = function(knex) {
  return knex('harvestUseType').where({
    harvest_use_type_id: 10,
    harvest_use_type_name: 'Donation' }).del();
};

exports.down = function(knex) {
  return knex('harvestUseType').insert({
    harvest_use_type_id: 10,
    harvest_use_type_name: 'Donation',
    harvest_use_type_translation_key: 'DONATION' });
};
