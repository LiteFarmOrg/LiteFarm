
exports.up = function (knex) {
  return Promise.all([
    knex('rolePermissions').insert([
      { role_id: 3, permission_id: 25 },
    ]),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id: 3, permission_id: 25 }).del(),
  ]);
};
