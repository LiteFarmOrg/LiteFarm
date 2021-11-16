exports.up = function(knex) {
  return knex('pest_control_task').whereIn('product_quantity_unit', ['l', 'gal', 'ml', 'fl-oz']).update({ product_quantity_unit: 'kg' });
};

exports.down = function(knex) {

};
