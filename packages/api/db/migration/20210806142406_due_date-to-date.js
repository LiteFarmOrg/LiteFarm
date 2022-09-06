export const up = function (knex) {
  return knex.raw('ALTER TABLE task ALTER COLUMN due_date TYPE date');
};

export const down = function (knex) {
  return knex.raw('ALTER TABLE task ALTER COLUMN due_date  TYPE timestamp');
};
