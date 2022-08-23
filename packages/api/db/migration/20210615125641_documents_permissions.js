export const up = function (knex) {
  return Promise.all([
    knex('permissions').insert([
      { permission_id: 121, name: 'get:document', description: 'Get a document' },
      { permission_id: 122, name: 'add:document', description: 'Create a document' },
      { permission_id: 123, name: 'edit:document', description: 'Edit a document' },
      { permission_id: 124, name: 'delete:document', description: 'Delete a document' },
    ]),
    knex('rolePermissions').insert([
      { role_id: 1, permission_id: 121 },
      { role_id: 2, permission_id: 121 },
      { role_id: 5, permission_id: 121 },
      { role_id: 1, permission_id: 122 },
      { role_id: 2, permission_id: 122 },
      { role_id: 5, permission_id: 122 },
      { role_id: 1, permission_id: 123 },
      { role_id: 2, permission_id: 123 },
      { role_id: 5, permission_id: 123 },
      { role_id: 1, permission_id: 124 },
      { role_id: 2, permission_id: 124 },
      { role_id: 5, permission_id: 124 },
    ]),
    knex.raw('ALTER TABLE document ALTER COLUMN document_id SET DEFAULT uuid_generate_v1()'),
  ]);
};

export const down = function (knex) {
  const permissions = [121, 122, 123, 124];
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissions).del(),
    knex('permissions').whereIn('permission_id', permissions).del(),
  ]);
};
