export const up = async function (knex) {
  await knex('permissions')
    .insert([
      { permission_id: 135, name: 'add:nomination', description: 'Nominate an piece of data' },
      { permission_id: 136, name: 'edit:nomination', description: 'Edit a nomination' },
      { permission_id: 137, name: 'delete:nomination', description: 'Delete a nomination' },
    ])
    .returning('permission_id');
  //Copied role permissions for add, edit delete crop
  await knex('rolePermissions').insert([
    { role_id: 1, permission_id: 135 },
    { role_id: 2, permission_id: 135 },
    { role_id: 5, permission_id: 135 },
    { role_id: 1, permission_id: 136 },
    { role_id: 2, permission_id: 136 },
    { role_id: 5, permission_id: 136 },
    { role_id: 1, permission_id: 137 },
    { role_id: 2, permission_id: 137 },
    { role_id: 5, permission_id: 137 },
  ]);
};

export const down = function (knex) {
  const permissionIds = [135, 136, 137];
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissionIds).del(),
    knex('permissions').whereIn('permission_id', permissionIds).del(),
  ]);
};
