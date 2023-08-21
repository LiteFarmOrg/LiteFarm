import { seed } from '../seeds/put_all_datasets.js';
import * as dotenv from 'dotenv';
dotenv.config();

export const up = function (knex) {
  if (process.env.NODE_ENV === 'development') {
    return seed(knex);
  }
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
