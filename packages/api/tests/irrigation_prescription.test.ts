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

describe('Irrigation Prescription Tests', () => {
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
      .post('/irrigation_prescription/request')
      .set('content-type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .query({ allOrgs, shouldSend });
  }

  beforeEach(async () => {
    mockedAxios.default.mockClear();
  });

  afterEach(async () => {
    await tableCleanup(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('POST irrigation prescription request', () => {
    [1, 2, 3, 5].forEach((role) => {
      test(`User with role ${role} should should initiate IP with field and crop data`, async () => {
        mockedAxios.default.mockResolvedValue({
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
