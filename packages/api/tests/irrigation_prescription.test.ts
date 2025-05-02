/*
 *  Copyright 2025 LiteFarm.org
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
import { Response } from 'superagent';

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

import { setupFarmEnvironment } from './utils/testDataSetup.js';
import { connectFarmToEnsemble, fakeIrrigationPrescriptions } from './utils/ensembleUtils.js';
import type { Farm, IrrigationTask, User } from '../src/models/types.js';
import mocks from './mock.factories.js';

describe('Get Irrigation Prescription Tests', () => {
  async function postIrrigationTask({
    farm_id,
    user_id,
    data,
  }: {
    farm_id: Farm['farm_id'];
    user_id: User['user_id'];
    data: Partial<IrrigationTask>;
  }) {
    return chai
      .request(server)
      .post(`/task/irrigation_task`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  async function getIrrigationPrescription({
    farm_id,
    user_id,
    afterDate = new Date().toISOString(),
    shouldSend = 'true',
  }: {
    farm_id: Farm['farm_id'];
    user_id: User['user_id'];
    afterDate?: string;
    shouldSend?: string;
  }): Promise<Response> {
    return chai
      .request(server)
      .get('/irrigation_prescription')
      .set('content-type', 'application/json')
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .query({ afterDate, shouldSend });
  }

  beforeEach(async () => {
    (mockedAxios as unknown as jest.Mock).mockClear();
    await mocks.populateTaskTypes();
  });

  afterEach(async () => {
    await tableCleanup(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('All users should be able to GET irrigation prescription', () => {
    [1, 2, 3, 5].forEach((role) => {
      test(`User with role ${role} should request IPs`, async () => {
        const MOCK_EXTERNAL_PRESCRIPTION_ID1 = 1;
        const MOCK_EXTERNAL_PRESCRIPTION_ID2 = 2;
        const [taskTypeInDb] = await knex('task_type').where({
          farm_id: null,
          task_translation_key: 'IRRIGATION_TASK',
        });
        const { farm, field, user } = await setupFarmEnvironment(role);

        // Make one task for prescription 1
        await postIrrigationTask({
          farm_id: farm.farm_id,
          user_id: user.user_id,
          data: mocks.fakeTask({
            task_type_id: taskTypeInDb.task_type_id,
            irrigation_task: mocks.fakeIrrigationTask({
              location_id: field.location_id,
              irrigation_prescription_external_id: MOCK_EXTERNAL_PRESCRIPTION_ID1,
            }),
          }),
        });

        const { farmAddon } = await connectFarmToEnsemble(farm);
        (mockedAxios as unknown as jest.Mock).mockResolvedValue({
          data: fakeIrrigationPrescriptions(
            farm.farm_id,
            [MOCK_EXTERNAL_PRESCRIPTION_ID1, MOCK_EXTERNAL_PRESCRIPTION_ID2],
            field.location_id,
          ),
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        });

        await getIrrigationPrescription({
          farm_id: farm.farm_id,
          user_id: user.user_id,
        });

        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'get',
            url: expect.stringContaining(
              `/organizations/${farmAddon.org_pk}/irrigation_prescriptions`, // real URL here
            ),
          }),
        );
      });
    });
  });
});
