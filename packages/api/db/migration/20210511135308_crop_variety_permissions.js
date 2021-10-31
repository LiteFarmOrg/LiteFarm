exports.up = function(knex) {
  return Promise.all([
    knex('permissions').insert([
      { permission_id: 117, name: 'get:crop_variety', description: 'Get a crop variety' },
      { permission_id: 118, name: 'add:crop_variety', description: 'Create a crop variety' },
      { permission_id: 119, name: 'edit:crop_variety', description: 'Edit a crop variety' },
      { permission_id: 120, name: 'delete:crop_variety', description: 'Delete a crop variety' },
    ]),
    knex('rolePermissions').insert([
      { role_id: 1, permission_id: 117 },
      { role_id: 2, permission_id: 117 },
      { role_id: 3, permission_id: 117 },
      { role_id: 5, permission_id: 117 },
      { role_id: 1, permission_id: 118 },
      { role_id: 2, permission_id: 118 },
      { role_id: 5, permission_id: 118 },
      { role_id: 1, permission_id: 119 },
      { role_id: 2, permission_id: 119 },
      { role_id: 5, permission_id: 119 },
      { role_id: 1, permission_id: 120 },
      { role_id: 2, permission_id: 120 },
      { role_id: 5, permission_id: 120 },
    ]),
  ]);
};

exports.down = function(knex) {
  const permissions = [117, 118, 119, 120];
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissions).del(),
    knex('permissions').whereIn('permission_id', permissions).del(),
  ]);
};
