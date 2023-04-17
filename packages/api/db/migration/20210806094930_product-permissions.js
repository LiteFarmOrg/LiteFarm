export const up = function (knex) {
  return Promise.all([
    knex('permissions').insert([
      { permission_id: 129, name: 'add:product', description: 'Add a product' },
    ]),
    knex('rolePermissions').insert([
      { role_id: 1, permission_id: 129 },
      { role_id: 2, permission_id: 129 },
      { role_id: 5, permission_id: 129 },
    ]),
  ]);
};

export const down = function (knex) {
  const permissions = [129];
  return Promise.all([
    knex('rolePermissions').whereIn('permission_id', permissions).del(),
    knex('permissions').whereIn('permission_id', permissions).del(),
  ]);
};
