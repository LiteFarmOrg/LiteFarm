/*
 *  Copyright (c) 2025 LiteFarm.org
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

import chai from 'chai';

import chaiHttp from 'chai-http';
chai.use(chaiHttp);

import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);

import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

import mocks from './mock.factories.js';
import { returnUserFarms } from './utils/testDataSetup.js';
import { Response } from 'superagent';
import { connectFarmToEnsemble } from './utils/ensembleUtils.js';
import { mockedFormattedReadingsData, mockedEnsembleReadingsData } from './utils/sensorMockData.js';
import { Farm, User } from '../src/models/types.js';

describe('Sensor Tests', () => {
  let farm: Farm;
  let newOwner: User;

  async function getSensorReadingsRequest({
    user_id = newOwner.user_id,
    farm_id = farm.farm_id,
    esids,
    startTime,
    endTime,
    truncPeriod,
  }: {
    user_id: User['user_id'];
    farm_id: Farm['farm_id'];
    esids: string;
    startTime?: string;
    endTime?: string;
    truncPeriod?: string;
  }): Promise<Response> {
    return chai
      .request(server)
      .get('/sensor/readings/')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .query({ esids, startTime, endTime, truncPeriod });
  }

  beforeEach(async () => {
    [farm] = await mocks.farmFactory();
    [newOwner] = await mocks.usersFactory();
    (mockedAxios as unknown as jest.Mock).mockClear();
  });

  afterEach(async () => {
    await tableCleanup(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('GET sensor readings tests', () => {
    [1, 2, 3, 5].forEach((role) => {
      test(`User with role ${role} should get sensor readings`, async () => {
        (mockedAxios as unknown as jest.Mock).mockResolvedValue({
          data: mockedEnsembleReadingsData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        });

        const { mainFarm, user } = await returnUserFarms(role);

        const { farmAddon } = await connectFarmToEnsemble(mainFarm);

        const res = await getSensorReadingsRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
          esids: 'TESTID1,TESTID2',
        });

        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'get',
            url: expect.stringContaining(
              `/organizations/${farmAddon.org_pk}/data/?sensor_esid=${encodeURIComponent('TESTID1,TESTID2')}`,
            ),
          }),
        );

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockedFormattedReadingsData);
      });
    });
  });
});
