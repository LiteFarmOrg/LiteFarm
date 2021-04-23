
const certifiers = [
    { certification_type: 2, certifier_name: 'Rede Ecovida', certifier_acronym: 'Ecovita' },
  ];

exports.up = async function(knex) {
    await knex.batchInsert('certifiers', certifiers);

};

exports.down = async function(knex) {
    for (const certifier of certifiers) {
        await knex('certifiers').where(certifier).delete();
    }

};
