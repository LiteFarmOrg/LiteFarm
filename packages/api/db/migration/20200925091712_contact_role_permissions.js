exports.up = function(knex, Promise) {
    return Promise.all([
        knex('rolePermissions').insert([
          { role_id: 1, permission_id: 93 },
          { role_id: 2, permission_id: 93 },
        ]),
      ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex('rolePermissions').where({permission_id: 93}).del(),
      ]);
};