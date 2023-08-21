export const up = function (knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id: 3, permission_id: 27 }).delete(), // delete:farm
    knex('rolePermissions').where({ role_id: 3, permission_id: 46 }).delete(), // edit:farm
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('rolePermissions').insert({ role_id: 3, permission_id: 27 }), // delete:farm
    knex('rolePermissions').insert({ role_id: 3, permission_id: 46 }), // edit:farm
  ]);
};
