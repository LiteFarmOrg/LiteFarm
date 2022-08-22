export const up = async function (knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('documents').defaultTo(false);
    t.timestamp('documents_end').nullable().defaultTo(null);
    t.boolean('compliance_docs_and_certification').defaultTo(false);
    t.timestamp('compliance_docs_and_certification_end').nullable().defaultTo(null);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.dropColumn('documents');
    t.dropColumn('documents_end');
    t.dropColumn('compliance_docs_and_certification');
    t.dropColumn('compliance_docs_and_certification_end');
  });
};
