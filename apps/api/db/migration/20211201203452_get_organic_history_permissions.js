const NEW_PERMISSION_ID = 131;

export const up = async function (knex) {
  return Promise.all([
    knex('permissions').insert([
      {
        permission_id: NEW_PERMISSION_ID,
        name: 'get:organic_history',
        description: 'Get organic history entries',
      },
    ]),
    knex('rolePermissions').insert([
      { role_id: 1, permission_id: NEW_PERMISSION_ID },
      { role_id: 2, permission_id: NEW_PERMISSION_ID },
      { role_id: 5, permission_id: NEW_PERMISSION_ID },
    ]),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('rolePermissions').where('permission_id', NEW_PERMISSION_ID).del(),
    knex('permissions').where('permission_id', NEW_PERMISSION_ID).del(),
  ]);
};
