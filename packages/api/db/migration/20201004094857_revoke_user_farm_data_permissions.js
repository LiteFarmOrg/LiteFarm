exports.up = function (knex) {
  return Promise.all([
    knex('rolePermissions').where({ role_id: 3, permission_id: 8 }).del(),
    knex('rolePermissions').where({ role_id: 3, permission_id: 65 }).del(),
  ])

};

exports.down = function (knex) {
  return Promise.all([
    knex('rolePermissions').insert({ role_id: 3, permission_id: 8 }),
    knex('rolePermissions').insert({ role_id: 3, permission_id: 65 }),
  ])
};

