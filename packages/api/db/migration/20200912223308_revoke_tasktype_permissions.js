
exports.up = function(knex, Promise) {
  return Promise.all([
    knex('rolePermissions').where({ role_id:3, permission_id:20 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:39 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:56 }).del(),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 20 },
      { role_id: 3, permission_id: 39 },
      { role_id: 3, permission_id: 56 },
    ]),
  ]);
};
