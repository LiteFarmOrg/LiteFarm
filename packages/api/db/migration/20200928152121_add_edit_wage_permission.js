export const up = function (knex) {
  return Promise.all([
    knex('permissions').insert({
      permission_id: 84,
      name: 'edit:user_wage',
      description: 'edit user wage',
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([knex('permissions').where({ permission_id: 84 }).del()]);
};
