exports.up = function (knex) {

  return Promise.all([
    knex('userFarm').update({ step_four: false, step_five: false, step_four_end: null, step_five_end: null }),
  ])
};

exports.down = function (knex) {
  return Promise.all([
    knex('userFarm').update({ step_four: true, step_five: true, step_four_end: knex.fn.now(), step_five_end: knex.fn.now() }),
  ])
};
