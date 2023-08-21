import * as dotenv from 'dotenv';
dotenv.config();
import hscodes from '../seeds/seedData/hscode.json';

export const up = function (knex) {
  if (process.env.NODE_ENV !== 'test') {
    return knex.batchInsert('hs_code', hscodes);
  }
};

export const down = function (knex) {
  return knex('hs_code').delete();
};
