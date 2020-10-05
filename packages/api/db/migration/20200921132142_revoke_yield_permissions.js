exports.up = function(knex) {
    return Promise.all([
      knex('rolePermissions').where({ role_id:3, permission_id:22 }).del(),
      knex('rolePermissions').where({ role_id:3, permission_id:41 }).del(),
      knex('rolePermissions').where({ role_id:3, permission_id:60 }).del(),
    ]);
  };

  exports.down = function(knex) {
    return Promise.all([
      knex('rolePermissions').insert([
        { role_id: 3, permission_id: 22 },
        { role_id: 3, permission_id: 41 },
        { role_id: 3, permission_id: 60 },
      ]),
    ]);
  };