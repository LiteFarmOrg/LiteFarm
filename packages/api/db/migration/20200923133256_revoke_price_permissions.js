exports.up = function(knex, Promise) {
    return Promise.all([
      knex('rolePermissions').where({ role_id:3, permission_id:16 }).del(),
      knex('rolePermissions').where({ role_id:3, permission_id:36 }).del(),
      knex('rolePermissions').where({ role_id:3, permission_id:53 }).del(),
    ]);
  };

  exports.down = function(knex, Promise) {
    return Promise.all([
      knex('rolePermissions').insert([
        { role_id: 3, permission_id: 16 },
        { role_id: 3, permission_id: 36 },
        { role_id: 3, permission_id: 53 },
      ]),
    ]);
  };