const { seed } = require('../seeds/put_all_datasets');
require('dotenv').config();
exports.up = function(knex) {
  if (process.env.NODE_ENV === 'development') {
    return seed(knex);
  }
};

exports.down = function(knex) {
};
