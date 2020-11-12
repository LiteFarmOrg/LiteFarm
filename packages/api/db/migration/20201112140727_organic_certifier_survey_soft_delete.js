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
      // Step1: Create migration
      table.boolean('deleted').defaultTo(false);
      // table.string('created_by_user_id').references('user_id').inTable('users');
      // table.string('updated_by_user_id').references('user_id').inTable('users');
      // table.dateTime('created_at').notNullable();
      // table.dateTime('updated_at').notNullable();
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
