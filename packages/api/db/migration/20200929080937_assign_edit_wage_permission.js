
exports.up = function(knex, Promise) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 1, permission_id: 84 },
      { role_id: 2, permission_id: 84 },
    ])
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex('rolePermissions').where({ role_id:1, permission_id:84 }).del(),
    knex('rolePermissions').where({ role_id:2, permission_id:84 }).del(),
  ]);
};
