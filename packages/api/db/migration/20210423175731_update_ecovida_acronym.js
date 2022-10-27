export const up = function (knex) {
  return Promise.all([
    knex('certifiers').where({ certifier_id: 18 }).update({ certifier_acronym: 'Ecovida' }),
  ]);
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
