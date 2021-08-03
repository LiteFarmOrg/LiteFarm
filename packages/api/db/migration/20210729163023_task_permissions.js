exports.up = function (knex) {
  return Promise.all([
    knex('permissions').insert([
      { permission_id: 125, name: 'add:task', description: 'Add a task' },
      { permission_id: 126, name: 'edit:task', description: 'Edit a task' },
      { permission_id: 127, name: 'delete:task', description: 'Delete a task' },
      { permission_id: 128, name: 'patch_status:task', description: 'Patch a task status' },
    ]),
    knex('rolePermissions').insert([
      { role_id: 1, permission_id: 125 },
      { role_id: 2, permission_id: 125 },
      { role_id: 5, permission_id: 125 },
      { role_id: 1, permission_id: 126 },
      { role_id: 2, permission_id: 126 },
      { role_id: 5, permission_id: 126 },
      { role_id: 1, permission_id: 127 },
      { role_id: 2, permission_id: 127 },
      { role_id: 5, permission_id: 127 },
      { role_id: 1, permission_id: 128 },
      { role_id: 2, permission_id: 128 },
      { role_id: 5, permission_id: 128 },
    ]),
  ]);
};

exports.down = function (knex) {
  const permissions = [125, 126, 127, 128];
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissions).del(),
    knex('permissions').whereIn('permission_id', permissions).del(),
  ]);
};
