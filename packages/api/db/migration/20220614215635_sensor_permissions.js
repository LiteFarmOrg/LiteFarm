exports.up = async function (knex) {
  await knex('permissions').insert([
    { permission_id: 132, name: 'add:sensors', description: 'add sensors' },
    { permission_id: 133, name: 'edit:sensors', description: 'edit sensors' },
    { permission_id: 134, name: 'delete:sensors', description: 'delete sensors' },
  ]);
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 132 },
    { role_id: 2, permission_id: 132 },
    { role_id: 5, permission_id: 132 },
    { role_id: 1, permission_id: 133 },
    { role_id: 2, permission_id: 133 },
    { role_id: 5, permission_id: 133 },
    { role_id: 1, permission_id: 134 },
    { role_id: 2, permission_id: 134 },
    { role_id: 5, permission_id: 134 },
  ]);
};

exports.down = function (knex) {
  const permissions = [132, 133, 134];
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissions).del(),
    knex('permissions').whereIn('permission_id', permissions).del(),
  ]);
};
