export const up = function (knex) {
  return knex('certifier_country').insert({ certifier_id: 19, country_id: 28 });
};

export const down = function (knex) {
  return knex('certifier_country').where({ certifier_id: 19 }).delete();
};
