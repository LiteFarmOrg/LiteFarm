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

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      database: 'mock_farm',
      user:     'postgres',
      password: '7413246',
    },
    migrations: {
      directory: __dirname + '/db/migration',
    },
    seeds: {
      directory: __dirname + '/db/seeds',
    },
  },

  ci: {
    client: 'postgresql',
    connection: {
      host: 'postgres',
      database: 'mock_farm',
      user:     'postgres',
      password: 'postgres',
    },
    migrations: {
      directory: __dirname + '/db/migration',
    },
    seeds: {
      directory: __dirname + '/db/seeds',
    },
  },

  integration: {
    client: 'postgresql',
    debug: true,
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + '/db/migration',
    },
    seeds: {
      directory: __dirname + '/db/seeds',
    },
    ssl: true,
  },

  production: {
    client: 'postgresql',
    debug: true,
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + '/db/migration',
    },
    seeds: {
      directory: __dirname + '/db/seeds',
    },
    ssl: true,
  },
  test: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      database: 'test_farm',
      user:     'postgres',
      password: 'pipeline',
    },
    migrations: {
      directory: __dirname + '/db/migration',
    },
    seeds: {
      directory: __dirname + '/db/seeds',
    },
  },
  pipeline: {
    client: 'postgresql',
    connection: {
      host: 'postgres',
      port: 5432,
      database: 'test_farm',
      user:     'postgres',
      password: 'pipeline',
    },
    migrations: {
      directory: __dirname + '/db/migration',
    },
    seeds: {
      directory: __dirname + '/db/seeds',
    },
  },
};
