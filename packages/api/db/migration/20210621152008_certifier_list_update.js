const certifiersToDelete = [ 11, 12, 14 ];
const oldCertifiers = [
  {
    certifier_id: 14,
    certification_type: 2,
    certifier_name: 'Associação Movimento Mecenas da Vida',
    certifier_acronym: 'MMV',
  },
  {
    certifier_id: 11,
    certification_type: 2,
    certifier_name: 'Centro de Estudos e Promoção da Agricultura de Grupo',
    certifier_acronym: 'CEPAGRO',
  },
  {
    certifier_id: 12,
    certification_type: 2,
    certifier_name: 'Centro de Tecnologias Alternativas Populares',
    certifier_acronym: 'CETAP',
  },
];
const newCertifier = {
  certification_type: 2,
  certifier_name: 'Redes Povos da Mata',
  certifier_acronym: 'Povos da Mata',
}

exports.up = async function (knex) {
  await knex('certifier_country').whereIn('certifier_id', certifiersToDelete).delete();
  return Promise.all([
    knex('certifiers').whereIn('certifier_id', certifiersToDelete).delete(),
    knex('certifiers').insert(newCertifier),
  ])
};

exports.down = async function (knex) {
  await Promise.all([
    knex('certifiers').where(newCertifier).delete(),
    knex.batchInsert('certifiers', oldCertifiers),
  ]);
  await knex.batchInsert('certifier_country', certifiersToDelete.map((n) => ({
    certifier_id: n,
    country_id: 28, // Brazil
  })))
};
