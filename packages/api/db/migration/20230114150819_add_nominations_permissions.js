export const up = async function (knex) {
  //repair the permissions auto increment
  await knex.raw(
    "BEGIN; LOCK TABLE permissions IN EXCLUSIVE MODE; SELECT setval('permissions_permission_id_seq', (SELECT COALESCE((SELECT MAX(permission_id)+1 FROM permissions), 1)), false); COMMIT;",
  );
  const newRoles = await knex('permissions')
    .insert([
      { name: 'add:nomination', description: 'Nominate an piece of data' },
      { name: 'edit:nomination', description: 'Edit a nomination' },
      { name: 'delete:nomination', description: 'Delete a nomination' },
    ])
    .returning('permission_id');
  //Copied role permissions for add, edit delete crop
  for (const roleId of newRoles) {
    await knex('rolePermissions').insert([
      { role_id: 1, permission_id: roleId },
      { role_id: 2, permission_id: roleId },
      { role_id: 5, permission_id: roleId },
    ]);
  }
};

export const down = function (knex) {
  const permissions = ['add:nomination', 'edit:nomination', 'delete:nomination'];
  const permissionIds = knex('permissions').select('permission_id').whereIn('name', permissions);
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissionIds).del(),
    knex('permissions').whereIn('permission_id', permissionIds).del(),
    knex.raw(
      "BEGIN; LOCK TABLE permissions IN EXCLUSIVE MODE; SELECT setval('permissions_permission_id_seq', 84, false); COMMIT;",
    ),
  ]);
};
