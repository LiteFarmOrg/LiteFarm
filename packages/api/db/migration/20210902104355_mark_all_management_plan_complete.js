exports.up = function(knex) {
  return knex('management_plan').update({ complete_date: knex.fn.now() });
};

exports.down = function(knex) {

};
