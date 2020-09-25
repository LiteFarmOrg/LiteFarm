exports.up = function(knex, Promise) {

    return Promise.all([
        knex('permissions').insert([
          { name: 'add:contact', description: 'add contact' },
        ]),
      ]);
  
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex('permissions').del(),
      ]);
};