export const up = function (knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id: 3, permission_id: 10 }).del(),
    knex('rolePermissions').where({ role_id: 3, permission_id: 30 }).del(),
    knex('rolePermissions').where({ role_id: 3, permission_id: 49 }).del(),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 10 },
      { role_id: 3, permission_id: 30 },
      { role_id: 3, permission_id: 49 },
    ]),
  ]);
};
