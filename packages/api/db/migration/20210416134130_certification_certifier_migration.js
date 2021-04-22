const certifications = [
  { certification_type: 'Organic', certification_translation_key: 'ORGANIC' },
  { certification_type: 'Participatory Guarantee System', certification_translation_key: 'PGS' },
];
const certifiers = [
  { certification_type: 1, certifier_name: 'Islands Organic Producers Association', certifier_acronym: 'IOPA', supported: true },
  { certification_type: 1, certifier_name: 'Kootenay Organic Growers Society', certifier_acronym: 'KOGS', supported: true },
  { certification_type: 1, certifier_name: 'Living Earth Organic Growers', certifier_acronym: 'LEOGA', supported: true },
  { certification_type: 1, certifier_name: 'British Columbia Association for Regenerative Agriculture', certifier_acronym: 'BCARA', supported: true },
  { certification_type: 1, certifier_name: 'Bio-Dynamic Agricultural Society of British Columbia', certifier_acronym: 'BDASBC', supported: true },
  { certification_type: 1, certifier_name: 'North Okanagan Organic Association', certifier_acronym: 'NOOA', supported: true },
  { certification_type: 1, certifier_name: 'Similkameen Okanagan Organic Producers Association', certifier_acronym: 'SOOPA', supported: true },
  { certification_type: 1, certifier_name: 'Pacific Agricultural Certification Society', certifier_acronym: 'PACS', supported: false },
  { certification_type: 1, certifier_name: 'Fraser Valley Organic Producers', certifier_acronym: 'FVOPA', supported: false },
  { certification_type: 2, certifier_name: 'Asociación de Productores Orgánicos', certifier_acronym: 'APRO', supported: true },
  { certification_type: 2, certifier_name: 'Centro de Estudos e Promoção da Agricultura de Grupo', certifier_acronym: 'CEPAGRO', supported: true },
  { certification_type: 2, certifier_name: 'Centro de Tecnologias Alternativas Populares', certifier_acronym: 'CETAP', supported: true },
  { certification_type: 2, certifier_name: 'Movimiento de economía Social y Solidaria del Ecuador', certifier_acronym: 'MESSE', supported: true },
  { certification_type: 2, certifier_name: 'Associação Movimento Mecenas da Vida', certifier_acronym: 'MMV', supported: true },
  { certification_type: 2, certifier_name: 'Centro Campesino para el Desarrollo Sustentable', certifier_acronym: 'CAMPESINO', supported: true },
  { certification_type: 2, certifier_name: 'Tijtoca Nemiliztli', certifier_acronym: 'TNAC', supported: true },
  { certification_type: 2, certifier_name: 'Fundación para el Desarrollo Socioeconómico y Restauración Ambiental', certifier_acronym: 'FUNDESYRAM', supported: true },
];


exports.up = async function (knex) {
  await knex.schema.renameTable('currency_table', 'countries');
  await knex.schema.createTable('certifications', (t) => {
    t.increments('certification_id');
    t.string('certification_type').notNullable();
    t.string('certification_translation_key').notNullable();
  })
  await knex.schema.createTable('certifiers', (t) => {
    t.increments('certifier_id');
    t.integer('certification_type').references('certification_id').inTable('certifications').notNullable();
    t.string('certifier_name').notNullable();
    t.string('certifier_acronym').notNullable();
    t.boolean('supported').notNullable();
  })
  await knex.schema.createTable('certifier_country', (t) => {
    t.increments('certifier_country_id');
    t.integer('certifier_id').references('certifier_id').inTable('certifiers');
    t.integer('country_id').references('id').inTable('countries');
  })
  await knex.batchInsert('certifications', certifications);
  await knex.batchInsert('certifiers', certifiers);
  const currentCertifiers = await knex('organicCertifierSurvey');
  const allCertifiers = await knex('certifiers');
  const newStructure = {
    requested_certification: null,
    requested_certifier: null,
    certifier_id: null,
    certification_id: null,
  }
  const updatedCertifiers = currentCertifiers.map((certifier) => {
    const match = allCertifiers.find(({ certifier_name, certifier_acronym }) => certifier.certifiers.includes(certifier_name) || certifier.certifiers.includes(certifier_acronym));
    if(match) {
      return {
        ...newStructure,
        survey_id: certifier.survey_id,
        certifier_id: match.certifier_id,
        certification_id: match.certification_type,
      }
    } else {
      return {
        ...newStructure,
        survey_id: certifier.survey_id,
        requested_certifier: certifier.certifiers.length ? certifier.certifiers[0] : null,
      }
    }
  });

  await knex.schema.alterTable('organicCertifierSurvey', (t) => {
    t.dropColumn('certifiers');
    t.string('requested_certification').nullable();
    t.string('requested_certifier').nullable();
    t.integer('certifier_id').references('certifier_id').inTable('certifiers').nullable();
    t.integer('certification_id').references('certification_id').inTable('certifications').nullable();
  });

  return Promise.all(updatedCertifiers.map((updatedCertifier) => {
    const { survey_id, ...data } = updatedCertifier;
    return knex('organicCertifierSurvey').where({ survey_id }).update(data);
  }))

};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.renameTable('countries', 'currency_table'),
    knex.schema.alterTable('organicCertifierSurvey', (t) => {
      t.jsonb('certifiers')
      t.dropColumn('requested_certification');
      t.dropColumn('requested_certifier');
      t.dropColumn('certifier_id');
      t.dropColumn('certification_id');
    }),
  ]).then(() => {
    return Promise.all([
      knex.schema.dropTable('certifier_country'),
      knex.schema.dropTable('certifiers'),
      knex.schema.dropTable('certifications'),
    ])
  })
}
