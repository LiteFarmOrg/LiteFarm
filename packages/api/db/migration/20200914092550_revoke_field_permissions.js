export const up = function (knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id: 3, permission_id: 11 }).del(),
    knex('rolePermissions').where({ role_id: 3, permission_id: 31 }).del(),
    knex('rolePermissions').where({ role_id: 3, permission_id: 50 }).del(),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 11 },
      { role_id: 3, permission_id: 31 },
      { role_id: 3, permission_id: 50 },
    ]),
  ]);
};
