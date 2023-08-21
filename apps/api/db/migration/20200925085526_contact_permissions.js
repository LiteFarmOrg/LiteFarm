export const up = function (knex) {
  return Promise.all([
    knex('permissions').insert([
      { permission_id: 83, name: 'add:contact', description: 'add contact' },
    ]),
  ]);
};

export const down = function (knex) {
  return Promise.all([knex('permissions').where({ permission_id: 83 }).del()]);
};
