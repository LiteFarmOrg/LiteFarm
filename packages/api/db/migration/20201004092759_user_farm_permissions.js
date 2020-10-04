exports.up = function (knex, Promise) {

    return Promise.all([
      knex('permissions').insert([
        { permission_id: 84, name: 'add:user_farm_info', description: 'add user farm info' },
      ]),
    ]);
  
  };
  
  exports.down = function (knex, Promise) {
    return Promise.all([
      knex('permissions').where({ permission_id: 84 }).del(),
    ]);
  };
  