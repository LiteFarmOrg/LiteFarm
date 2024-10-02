import { Kysely } from 'kysely';
import { KyselyKnexDialect, PGColdDialect } from 'kysely-knex';
import knex from './util/knex.js';
import { DB } from 'kysely-codegen';

export default new Kysely<DB>({
  dialect: new KyselyKnexDialect({
    knex: knex,
    kyselySubDialect: new PGColdDialect(),
  }),
});
