const certifier_country = [
  { certifier_id: 1, country_id: 37 },
  { certifier_id: 2, country_id: 37 },
  { certifier_id: 3, country_id: 37 },
  { certifier_id: 4, country_id: 37 },
  { certifier_id: 5, country_id: 37 },
  { certifier_id: 6, country_id: 37 },
  { certifier_id: 7, country_id: 37 },
  { certifier_id: 8, country_id: 37 },
  { certifier_id: 9, country_id: 37 },
  { certifier_id: 10, country_id: 157 },
  { certifier_id: 11, country_id: 28 },
  { certifier_id: 12, country_id: 28 },
  { certifier_id: 13, country_id: 61 },
  { certifier_id: 14, country_id: 28 },
  { certifier_id: 15, country_id: 128 },
  { certifier_id: 16, country_id: 128 },
  { certifier_id: 17, country_id: 63 },
];

exports.up = async function(knex) {
  await knex.batchInsert('certifier_country', certifier_country);

};

exports.down = function(knex) {
  return Promise.all(certifier_country.map(row => knex('certifier_country').where(row).delete()));
};
