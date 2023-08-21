export const up = function (knex) {
  return knex('task').update({ completed_time: knex.fn.now() });
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
