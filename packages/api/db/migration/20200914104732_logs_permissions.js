
exports.up = function(knex, Promise) {
  return Promise.all([
    knex('rolePermissions').where({ role_id:3, permission_id:33 }).del(),
    knex('rolePermissions').where({ role_id:3, permission_id:51 }).del(),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 33 },
      { role_id: 3, permission_id: 51 },
    ]),
  ]);
};
