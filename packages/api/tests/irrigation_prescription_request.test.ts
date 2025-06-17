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

import { setupFarmEnvironment, setupManagementPlans } from './utils/testDataSetup.js';
import { connectFarmToEnsemble } from './utils/ensembleUtils.js';

xdescribe('Irrigation Prescription Request Tests', () => {
  async function initiateIrrigationPrescriptionRequest({
    user_id,
    farm_id,
    allOrgs,
    shouldSend = 'true',
  }: {
    user_id: string;
    farm_id: string;
    allOrgs?: string;
    shouldSend?: string;
  }): Promise<Response> {
    return chai
      .request(server)
      .post('/irrigation_prescription_request')
      .set('content-type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .query({ allOrgs, shouldSend });
  }

  beforeEach(async () => {
    (mockedAxios as unknown as jest.Mock).mockClear();
  });

  afterEach(async () => {
    await tableCleanup(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('POST irrigation prescription request', () => {
    [1, 2, 3, 5].forEach((role) => {
      test(`User with role ${role} should initiate IP with field and crop data`, async () => {
        (mockedAxios as unknown as jest.Mock).mockResolvedValue({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        });

        const { farm, field, user } = await setupFarmEnvironment(role);

        const { farmAddon } = await connectFarmToEnsemble(farm);

        const { crop, transplantManagementPlan, seedManagementPlan } = await setupManagementPlans({
          farm,
          field,
        });

        await initiateIrrigationPrescriptionRequest({
          user_id: user.user_id,
          farm_id: farm.farm_id,
        });

        const cropConstants = {
          crop_common_name: crop.crop_common_name,
          crop_genus: crop.crop_genus,
          crop_specie: crop.crop_specie,
        };

        const expectedSeedCrop = expect.objectContaining({
          management_plan_id: seedManagementPlan.management_plan_id,
          seed_date: seedManagementPlan.seed_date,
          ...cropConstants,
        });

        const expectedTransplantCrop = expect.objectContaining({
          management_plan_id: transplantManagementPlan.management_plan_id,
          seed_date: transplantManagementPlan.seed_date,
          ...cropConstants,
        });

        const expectedCropData = [expectedSeedCrop, expectedTransplantCrop];

        const expectedFieldData = {
          farm_id: farm.farm_id,
          location_id: field.location_id,
          name: field.name,
          grid_points: field.figure.area.grid_points,
        };

        const expectedFieldAndCropData = {
          [farmAddon.org_uuid]: [
            {
              ...expectedFieldData,
              crop_data: expect.arrayContaining(expectedCropData),
            },
          ],
        };

        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'post',
            url: expect.stringContaining(
              `/irrigation_prescription/request`, // real URL here
            ),
            body: expectedFieldAndCropData,
          }),
        );
      });
    });
  });
});
