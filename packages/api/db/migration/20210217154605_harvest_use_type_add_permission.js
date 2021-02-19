exports.up = function(knex) {
  return Promise.all([
    knex('permissions').insert([
      { name: 'add:harvest_use', permission_id: 89, description: 'Add a harvest use type' },
    ]),
    knex('rolePermissions').insert([
      { role_id: 5, permission_id: 89 },
      { role_id: 1, permission_id: 89 },
      { role_id: 2, permission_id: 89 },
    ]),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex('rolePermissions').where({ permission_id: 89 }).del(),
    knex('permissions').where({ permission_id: 89 }).del(),
  ]);
};
