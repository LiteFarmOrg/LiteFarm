exports.up = function(knex) {
  return knex('task').update({ completed_time: knex.fn.now() });
};

exports.down = function(knex) {

};
