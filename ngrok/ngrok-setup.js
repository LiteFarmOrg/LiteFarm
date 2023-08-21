/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
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

const fs = require('fs').promises;
const path = require('path');
const http = require('http');

function getRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      response.on('data', (data) => resolve(JSON.parse(data.toString('utf8'))));
      response.on('error', reject);
    });
  });
}

/**
 * Returns an object containing the ngrok URLs that are forwarding
 * requests to localhost ports.
 */
async function getURLObj() {
  const response = await getRequest('http://localhost:4040/api/tunnels');

  const ngrokURLs = {};
  for (const tunnel of response['tunnels']) {
    ngrokURLs[tunnel['name']] = tunnel['public_url'];
  }

  return ngrokURLs;
}

/**
 * Adds the given ngrokURLs to the environment variables in envPath
 * @param {Object} ngrokURLs - { api, webapp } each key contains the corresponding url
 * @param {String} envPath - path to a .env file
 * @param {String} prefix - each key added to the .env file will be prefixed with this string
 */
async function addURLsToEnv(ngrokURLs, envPath, prefix) {
  const keysAddedToEnv = [];
  const data = (await fs.readFile(envPath)).toString('utf8').split('\n');

  for (let i = 0; i < data.length; i++) {
    for (const key in ngrokURLs) {
      if (
        !keysAddedToEnv.includes(key) &&
        data[i].startsWith(prefix + key.toUpperCase())
      ) {
        data[i] = prefix + key.toUpperCase() + '=' + ngrokURLs[key];
        keysAddedToEnv.push(key);
      }
    }
  }

  const endingChar = data[data.length - 1] === '' ? '' : '\n';

  await fs.writeFile(envPath, data.join('\n') + endingChar, {
    flag: 'w',
    encoding: 'utf8',
  });

  for (const key in ngrokURLs) {
    if (!keysAddedToEnv.includes(key)) {
      await fs.appendFile(
        envPath,
        prefix + key.toUpperCase() + '=' + ngrokURLs[key] + '\n'
      );
      keysAddedToEnv.push(key);
    }
  }
}

async function runSetup() {
  try {
    const ngrokURLs = await getURLObj();

    const envPath = path.resolve(__dirname, '..', '.env');

    await addURLsToEnv(ngrokURLs, envPath, 'NGROK_');
  } catch (error) {
    console.error('Unable to set up ngrok environment variables.');
    console.error(error);
  }
}

runSetup();
