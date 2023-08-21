export const up = function (knex) {
  return Promise.all([
    knex('rolePermissions').insert({ role_id: 3, permission_id: 126 }), // edit:task
    knex('rolePermissions').insert({ role_id: 3, permission_id: 128 }), // patch_status:task
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id: 3, permission_id: 126 }).delete(), // edit:task
    knex('rolePermissions').where({ role_id: 3, permission_id: 128 }).delete(), // patch_status:task
  ]);
};
