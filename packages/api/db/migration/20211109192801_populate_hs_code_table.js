require('dotenv').config();
const hscodes = require('../seeds/seedData/hscode.json');
exports.up = function(knex) {
  if (process.env.NODE_ENV !== 'test') {
    return knex.batchInsert('hs_code', hscodes);
  }
};

exports.down = function(knex) {
  return knex('hs_code').delete();
};
