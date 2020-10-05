
exports.up = function(knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id:3, permission_id:14 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:35 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:52 }).del(),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 14 },
      { role_id: 3, permission_id: 35 },
      { role_id: 3, permission_id: 52 },
    ]),
  ]);
};
