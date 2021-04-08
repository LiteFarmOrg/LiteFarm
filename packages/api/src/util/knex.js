const pg = require('pg');
const PG_DECIMAL_OID = 1700;
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat);
const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];
const knex = Knex(config);

module.exports = knex;
