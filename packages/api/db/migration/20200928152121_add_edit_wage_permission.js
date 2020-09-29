
exports.up = function(knex, Promise) {
  return Promise.all([
    knex('permissions').insert({ name: 'edit:user_wage', description: 'edit user wage' })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex('permissions').where({ name: 'edit:user_wage' }).del()
  ]);
};
