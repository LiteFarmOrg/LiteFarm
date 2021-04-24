
const certifier_country = [
    { certifier_id: 18, country_id: 28 },
  ];

exports.up = async function(knex) {
    await knex.batchInsert('certifier_country', certifier_country);
  
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('certifier_country')
      ])
  
};
