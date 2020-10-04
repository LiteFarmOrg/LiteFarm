exports.up = function(knex, Promise) {
    return Promise.all([
      knex('rolePermissions').where({ role_id:3, permission_id:81 }).del(),
      knex('rolePermissions').where({ role_id:3, permission_id:84 }).del(),
    ]);
  };

  exports.down = function(knex, Promise) {
    return Promise.all([
      knex('rolePermissions').insert([
        { role_id: 3, permission_id: 81 },
        { role_id: 3, permission_id: 84 },
      ]),
    ]);
  };