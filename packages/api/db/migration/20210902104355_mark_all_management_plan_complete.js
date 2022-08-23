export const up = function (knex) {
  return knex('management_plan').update({ complete_date: knex.fn.now() });
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
