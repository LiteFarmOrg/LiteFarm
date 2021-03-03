
exports.up = function(knex) {
  return Promise.all([
    knex.raw('ALTER TABLE ground_water RENAME COLUMN user_for_irrigation TO used_for_irrigation'),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.raw('ALTER TABLE ground_water RENAME COLUMN used_for_irrigation TO user_for_irrigation'),
  ]);

};
