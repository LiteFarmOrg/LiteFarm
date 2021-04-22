
const certifiers = [
    { certification_type: 2, certifier_name: 'Rede Ecovida', certifier_acronym: 'Ecovita' },
  ];

exports.up = async function(knex) {
    await knex.batchInsert('certifiers', certifiers);
  
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('certifiers'),
    ])
  
};
