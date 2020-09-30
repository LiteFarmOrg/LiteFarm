exports.up = function (knex, Promise) {

  return Promise.all([
    knex('permissions').insert([
      { permission_id: 83, name: 'add:contact', description: 'add contact' },
    ]),
  ]);

};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex('permissions').where({ permission_id: 83 }).del(),
  ]);
};
