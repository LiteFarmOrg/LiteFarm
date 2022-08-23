export const up = function (knex) {
  return knex.raw('ALTER TABLE broadcast ALTER COLUMN percentage_planted TYPE NUMERIC(15,12)');
};

export const down = async function (knex) {
  await knex('broadcast').where({ percentage_planted: 100 }).update({ percentage_planted: 99.99 });
  return knex.raw('ALTER TABLE broadcast ALTER COLUMN percentage_planted TYPE NUMERIC(14,12)');
};
