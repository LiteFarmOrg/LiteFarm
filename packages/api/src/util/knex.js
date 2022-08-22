import pg from 'pg';
const PG_DECIMAL_OID = 1700;
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat);
import Knex from 'knex';
const environment = process.env.NODE_ENV || 'development';
import config from '../../.knex/knexfile.js';
const knex = Knex(config[environment]);

export default knex;
