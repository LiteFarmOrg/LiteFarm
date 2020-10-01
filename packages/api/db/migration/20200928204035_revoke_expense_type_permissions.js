exports.up = function(knex) {
    return Promise.all([
      knex('rolePermissions').where({ role_id:3, permission_id:6 }).del(),
      knex('rolePermissions').where({ role_id:3, permission_id:26 }).del(),
    ]);
  };

  exports.down = function(knex) {
    return Promise.all([
      knex('rolePermissions').insert([
        { role_id: 3, permission_id: 6 },
        { role_id: 3, permission_id: 26 },
      ]),
    ]);
  };