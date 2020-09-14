
exports.up = function(knex, Promise) {
  return Promise.all([
    knex('rolePermissions').where({ role_id:3, permission_id:9 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:29 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:48 }).del(),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 9 },
      { role_id: 3, permission_id: 29 },
      { role_id: 3, permission_id: 48 },
    ]),
  ]);
};
