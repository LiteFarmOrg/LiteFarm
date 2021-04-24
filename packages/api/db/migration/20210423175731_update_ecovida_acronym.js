exports.up = function(knex) {
    return Promise.all([
      knex('certifiers').where({ certifier_id: 18 }).update({ certifier_acronym: 'Ecovida' }),
    ]);
  };
  
  exports.down = function(knex) {
    return Promise.all([
        knex.schema.table('certifiers', (table) => {
            table.dropColumn('certifier_acronym');
          }),
    ]);
  };
  