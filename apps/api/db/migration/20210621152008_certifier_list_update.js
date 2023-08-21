const certifiersToDelete = [11, 12, 14];
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
  certifier_id: 19,
  certification_type: 2,
  certifier_name: 'Redes Povos da Mata',
  certifier_acronym: 'Povos da Mata',
};

export const up = async function (knex) {
  const ecovidaMigration = await knex('organicCertifierSurvey')
    .select('survey_id')
    .whereIn('certifier_id', [11, 12]);
  const ecovidaSurveyIds = ecovidaMigration.map((r) => r.survey_id);
  const redesPovoMigration = await knex('organicCertifierSurvey')
    .select('survey_id')
    .where({ certifier_id: 14 });
  const redesPovoSurveyIds = redesPovoMigration.map((r) => r.survey_id);
  await knex('organicCertifierSurvey')
    .update({ certifier_id: null })
    .whereIn('certifier_id', [11, 12, 14]);
  await knex('certifier_country').whereIn('certifier_id', certifiersToDelete).delete();
  await Promise.all([
    knex('certifiers').whereIn('certifier_id', certifiersToDelete).delete(),
    knex('certifiers').insert(newCertifier),
  ]);
  await Promise.all([
    knex('organicCertifierSurvey')
      .update({ certifier_id: 18 })
      .whereIn('survey_id', ecovidaSurveyIds),
    knex('organicCertifierSurvey')
      .update({ certifier_id: 19 })
      .whereIn('survey_id', redesPovoSurveyIds),
  ]);
};

export const down = async function (knex) {
  await knex('organicCertifierSurvey').update({ certifier_id: null }).whereIn('certifier_id', [19]);
  await Promise.all([
    knex('certifiers').where(newCertifier).delete(),
    knex.batchInsert('certifiers', oldCertifiers),
  ]);
  await knex.batchInsert(
    'certifier_country',
    certifiersToDelete.map((n) => ({
      certifier_id: n,
      country_id: 28, // Brazil
    })),
  );
};
