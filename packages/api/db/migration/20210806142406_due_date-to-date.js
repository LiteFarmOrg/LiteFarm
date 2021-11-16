
exports.up = function(knex) {
  return knex.raw('ALTER TABLE task ALTER COLUMN due_date TYPE date');
};

exports.down = function(knex) {
  return knex.raw('ALTER TABLE task ALTER COLUMN due_date  TYPE timestamp');
};
