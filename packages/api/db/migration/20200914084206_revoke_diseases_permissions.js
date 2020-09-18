
exports.up = function(knex, Promise) {
  return Promise.all([
    knex('rolePermissions').where({ role_id:3, permission_id:3 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:24 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:43 }).del(),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 3 },
      { role_id: 3, permission_id: 24 },
      { role_id: 3, permission_id: 43 },
    ]),
  ]);
};
  