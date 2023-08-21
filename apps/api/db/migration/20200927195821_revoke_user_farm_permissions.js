export const up = function (knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id: 3, permission_id: 58 }).del(),
    knex('rolePermissions').where({ role_id: 3, permission_id: 59 }).del(),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 58 },
      { role_id: 3, permission_id: 59 },
    ]),
  ]);
};
