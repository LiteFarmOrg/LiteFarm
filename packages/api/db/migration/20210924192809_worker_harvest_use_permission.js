
export const up = function (knex) {
  return Promise.all([
    knex('rolePermissions').insert({ role_id: 3, permission_id: 89 }), // add:harvest_use
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id: 3, permission_id: 89 }).delete(), // add:harvest_use
  ]);
};
