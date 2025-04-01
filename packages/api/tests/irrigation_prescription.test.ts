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
    trimmed = 'true',
  }: {
    user_id: string;
    farm_id: string;
    allOrgs?: string;
    trimmed?: string;
  }): Promise<Response> {
    return chai
      .request(server)
      .post('/irrigation_prescription/request')
      .set('content-type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .query({ allOrgs, trimmed });
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

        const res = await initiateIrrigationPrescriptionRequest({
          user_id: user.user_id,
          farm_id: farm.farm_id,
        });

        const cropConstants = {
          crop_common_name: crop.crop_common_name,
          crop_genus: crop.crop_genus,
          crop_specie: crop.crop_specie,
        };

        const expectedCropData = [
          expect.objectContaining({
            management_plan_id: seedManagementPlan.management_plan_id,
            // not sure why this date format discrepancy
            seed_date: seedManagementPlan.seed_date.toISOString().replace('Z', ''),
            ...cropConstants,
          }),
          expect.objectContaining({
            management_plan_id: transplantManagementPlan.management_plan_id,
            // not sure why this date format discrepancy
            seed_date: transplantManagementPlan.seed_date.toISOString().replace('Z', ''),
            ...cropConstants,
          }),
        ];

        const expectedFieldAndCropData = {
          [farmAddon.org_uuid]: [
            {
              farm_id: farm.farm_id,
              location_id: field.location_id,
              name: field.name,
              grid_points: field.figure.area.grid_points,
              crop_data: expect.arrayContaining(expectedCropData),
            },
          ],
        };

        // TODO: this is the actual test to use once the endpoint is finalized
        // expect(axios).toHaveBeenCalledWith(
        //   expect.objectContaining({
        //     method: 'post',
        //     url: expect.stringContaining(
        //       `/litefarm/irrigration_prescription/request`, // real URL here
        //     ),
        //     body: expectedFieldAndCropData,
        //   }),
        // );

        expect(res.status).toBe(200);
        expect(res.body).toEqual(expectedFieldAndCropData);
      });
    });
  });
});
