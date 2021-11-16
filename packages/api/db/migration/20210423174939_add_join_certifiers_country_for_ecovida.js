
const certifier_country = [
    { certifier_id: 18, country_id: 28 },
  ];

exports.up = async function(knex) {
    await knex.batchInsert('certifier_country', certifier_country);
  
};

exports.down = async function(knex) {
    for (const certifier of certifier_country) {
        await knex('certifier_country').where(certifier).delete();
    }

};
