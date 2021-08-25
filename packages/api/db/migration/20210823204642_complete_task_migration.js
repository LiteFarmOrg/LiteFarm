exports.up = function (knex) {
  return knex('task').update({ completed_time: new Date(2021, 8, 0) })
};

exports.down = function () {
};