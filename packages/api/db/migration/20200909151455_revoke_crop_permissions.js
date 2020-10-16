
exports.up = function(knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id:3, permission_id:2 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:23 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:42 }).del(),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 2 },
      { role_id: 3, permission_id: 23 },
      { role_id: 3, permission_id: 42 },
    ]),
  ]);
};
