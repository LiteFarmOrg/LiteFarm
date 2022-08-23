export const up = function (knex) {
  return knex('userFarm')
    .whereIn('farm_id', function () {
      this.select('farm_id').from('farm').whereNull('grid_points');
    })
    .whereNotNull('step_one_end')
    .update({ step_one: false, step_four: false });
};

export const down = function (knex) {
  return knex('userFarm')
    .whereIn('farm_id', function () {
      this.select('farm_id').from('farm').whereNull('grid_points');
    })
    .whereNotNull('step_one_end')
    .where({ step_one: false, step_four: false, step_five: true })
    .update({
      step_one: true,
      step_four: true,
    });
};
