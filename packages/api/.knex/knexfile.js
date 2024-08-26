/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (knexfile.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
// import path from 'path';
// import { fileURLToPath } from 'url';

import * as dotenv from 'dotenv';
import path from 'node:path';

const dirname = import.meta.dirname;

dotenv.config({ path: path.resolve(dirname, '../.env') });

const root = path.resolve(dirname, '../');

export default {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DEV_DATABASE_HOST,
      database: process.env.DEV_DATABASE,
      user: process.env.DEV_DATABASE_USER,
      password: process.env.DEV_DATABASE_PASSWORD,
      port: process.env.DEV_DATABASE_PORT || 5432,
    },
    migrations: {
      directory: root + '/db/migration',
    },
    seeds: {
      directory: root + '/db/seeds',
    },
  },

  ci: {
    client: 'postgresql',
    connection: {
      host: 'postgres',
      database: 'mock_farm',
      user: 'postgres',
      password: 'postgres',
    },
    migrations: {
      directory: root + '/db/migration',
    },
    seeds: {
      directory: root + '/db/seeds',
    },
  },

  integration: {
    client: 'postgresql',
    debug: true,
    connection: {
      host: process.env.DEV_DATABASE_HOST,
      database: process.env.DEV_DATABASE,
      user: process.env.DEV_DATABASE_USER,
      password: process.env.DEV_DATABASE_PASSWORD,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: root + '/db/migration',
    },
    seeds: {
      directory: root + '/db/seeds',
    },
  },

  production: {
    client: 'postgresql',
    debug: true,
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: root + '/db/migration',
    },
    seeds: {
      directory: root + '/db/seeds',
    },
    ssl: {
      rejectUnauthorized: false,
    },
  },
  test: {
    client: 'postgresql',
    connection: {
      host: process.env.TEST_DATABASE_HOST,
      database: process.env.TEST_DATABASE,
      user: process.env.TEST_DATABASE_USER,
      password: process.env.TEST_DATABASE_PASSWORD,
      port: process.env.TEST_DATABASE_PORT || 5432,
    },
    pool: { min: 0, max: 100 },
    migrations: {
      directory: root + '/db/migration',
    },
    seeds: {
      directory: root + '/db/seeds',
    },
  },
  pipeline: {
    client: 'postgresql',
    connection: {
      host: 'postgres',
      port: 5432,
      database: 'test_farm',
      user: 'postgres',
      password: 'pipeline',
    },
    pool: { min: 0, max: 100 },
    migrations: {
      directory: root + '/db/migration',
    },
    seeds: {
      directory: root + '/db/seeds',
    },
  },
};
