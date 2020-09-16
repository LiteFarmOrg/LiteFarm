
exports.up = function(knex, Promise) {
    return Promise.all([
      knex('rolePermissions').where({ role_id:3, permission_id:11 }).del(),
      knex('rolePermissions').where({ role_id:3, permission_id:31 }).del(),
      knex('rolePermissions').where({ role_id:3, permission_id:50 }).del(),
    ]);
  };
  
  exports.down = function(knex, Promise) {
    return Promise.all([
      knex('rolePermissions').insert([
        { role_id: 3, permission_id: 11 },
        { role_id: 3, permission_id: 31 },
        { role_id: 3, permission_id: 50 },
      ]),
    ]);
  };
  