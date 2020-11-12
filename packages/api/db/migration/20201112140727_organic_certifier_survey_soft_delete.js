exports.up = function (knex) {
  return Promise.all([
    knex('permissions').insert([
      { name: 'delete:organic_certifier_survey', permission_id: 88, description: 'Delete organic certifier survey' },
    ]),
    knex('rolePermissions').insert([
      { role_id: 5, permission_id: 88 },
      { role_id: 1, permission_id: 88 },
      { role_id: 2, permission_id: 88 },
    ]),
    knex.schema.alterTable('organicCertifierSurvey', (table) => {
      table.boolean('deleted').defaultTo(false)
    }),
  ]);

};

exports.down = function (knex) {
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', [88]).del(),
    knex('permissions').whereIn('permission_id', [88]).del(),
    knex.schema.alterTable('organicCertifierSurvey', (table) => {
      table.dropColumn('deleted')
    }),
  ]);
};
