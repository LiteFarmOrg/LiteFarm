export const up = function (knex) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 33 },
      { role_id: 3, permission_id: 51 },
    ]),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id: 3, permission_id: 33 }).del(),
    knex('rolePermissions').where({ role_id: 3, permission_id: 51 }).del(),
  ]);
};
