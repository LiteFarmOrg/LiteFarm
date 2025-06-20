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

import { ensembleAPICall } from '../src/util/ensemble.js';

jest.mock('../src/util/ensemble.js', () => ({
  ...jest.requireActual('../src/util/ensemble.js'),
  ensembleAPICall: jest.fn(async () => ({ data: [] })), // placeholder
}));

jest.mock('../src/util/geoUtils', () => ({
  ...jest.requireActual('../src/util/geoUtils'),
  getAreaOfPolygon: jest.fn(),
}));

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

import { setupFarmEnvironment } from './utils/testDataSetup.js';
import { connectFarmToEnsemble } from './utils/ensembleUtils.js';
import type { AddonPartner, Farm, User } from '../src/models/types.js';
import mocks from './mock.factories.js';
import { addDaysToDate, getEndOfDate, getStartOfDate } from '../src/util/date.js';
import { ENSEMBLE_BRAND } from '../src/util/ensemble.js';
import { generateMockPrescriptionDetails } from '../src/util/generateMockPrescriptionDetails.js';
import { getAreaOfPolygon } from '../src/util/geoUtils.js';

describe('Get Irrigation Prescription Tests', () => {
  let ESciAddonPartner: AddonPartner;

  async function getIrrigationPrescription({
    farm_id,
    user_id,
    startTime = getStartOfDate(new Date()).toISOString(),
    endTime = getEndOfDate(addDaysToDate(new Date(), 1)).toISOString(),
    shouldSend = 'true',
  }: {
    farm_id: Farm['farm_id'];
    user_id: User['user_id'];
    startTime: string;
    endTime: string;
    shouldSend: string;
  }): Promise<Response> {
    return chai
      .request(server)
      .get('/irrigation_prescriptions')
      .set('content-type', 'application/json')
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .query({ startTime, endTime, shouldSend });
  }

  async function getIrrigationPrescriptionDetails({
    farm_id,
    user_id,
    irrigationPrescriptionId,
    shouldSend = 'true',
  }: {
    farm_id: Farm['farm_id'];
    user_id: User['user_id'];
    irrigationPrescriptionId: number;
    shouldSend: string;
  }): Promise<Response> {
    return chai
      .request(server)
      .get(`/irrigation_prescriptions/${irrigationPrescriptionId}/`)
      .set('content-type', 'application/json')
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .query({ shouldSend });
  }

  function removeUndefined<T extends Record<string, unknown>>(arr: T[]): Partial<T>[] {
    return arr.map(
      (obj) =>
        Object.fromEntries(
          Object.entries(obj).filter(([, value]) => value !== undefined),
        ) as Partial<T>,
    );
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    await mocks.populateTaskTypes();
    [ESciAddonPartner] = await mocks.addon_partnerFactory({ name: ENSEMBLE_BRAND, id: 1 });
  });

  afterEach(async () => {
    await tableCleanup(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('All users should be able to GET irrigation prescription', () => {
    [1, 2, 3, 5].forEach((role) => {
      test(`2 User with role ${role} should request IPs`, async () => {
        // Farm setup
        const { farm, field, user } = await setupFarmEnvironment(role);
        await connectFarmToEnsemble(farm, ESciAddonPartner);

        // Just check linking of one task
        const ipConfig = [
          { id: 1, linkToTask: true },
          { id: 2, linkToTask: false },
        ];

        // Mock data for external endpoint
        const externalIrrigationPrescriptions = await Promise.all(
          ipConfig.map(async (config) =>
            mocks.buildExternalIrrigationPrescription({
              id: config.id,
              providedFarm: farm,
              providedLocation: field,
            }),
          ),
        );

        expect(externalIrrigationPrescriptions.length).toBe(2);
        expect(externalIrrigationPrescriptions[0].location_id).toBe(field.location_id);

        // Mock response from our endpoint including formatting
        const irrigationPrescriptions = await Promise.all(
          externalIrrigationPrescriptions.map(async (externalIrrigationPrescription) =>
            mocks.buildIrrigationPrescription({
              providedExternalIrrigationPrescription: externalIrrigationPrescription,
              providedPartner: ESciAddonPartner,
              linkToTask: false,
            }),
          ),
        );

        expect(irrigationPrescriptions.length).toBe(2);
        expect(irrigationPrescriptions[0].partner_id).toBe(ESciAddonPartner.id);

        // Call our endpoint and mock external call
        const mockedEnsembleAPICall = ensembleAPICall as jest.Mock;
        mockedEnsembleAPICall.mockResolvedValueOnce({ data: externalIrrigationPrescriptions });
        const res = await getIrrigationPrescription({
          farm_id: farm.farm_id,
          user_id: user.user_id,
          startTime: getStartOfDate(new Date()).toISOString(),
          endTime: getEndOfDate(addDaysToDate(new Date(), 1)).toISOString(),
          shouldSend: 'true',
        });

        expect(res.body).toMatchObject(removeUndefined(irrigationPrescriptions));

        // Mock our endpoint if linking a task
        const irrigationPrescriptionsWithTasks = await Promise.all(
          externalIrrigationPrescriptions.map(async (externalIrrigationPrescription, index) =>
            mocks.buildIrrigationPrescription({
              providedExternalIrrigationPrescription: externalIrrigationPrescription,
              providedPartner: ESciAddonPartner,
              linkToTask: ipConfig[index].linkToTask,
              providedFarm: farm,
              providedLocation: field,
            }),
          ),
        );

        expect(irrigationPrescriptionsWithTasks.length).toBe(2);
        expect(irrigationPrescriptionsWithTasks[0].task_id).toBeTruthy();

        // Re-call our endpoint and mock external call now seeing tasks populated
        mockedEnsembleAPICall.mockResolvedValueOnce({ data: irrigationPrescriptionsWithTasks });
        const res2 = await getIrrigationPrescription({
          farm_id: farm.farm_id,
          user_id: user.user_id,
          startTime: getStartOfDate(new Date()).toISOString(),
          endTime: getEndOfDate(addDaysToDate(new Date(), 1)).toISOString(),
          shouldSend: 'true',
        });

        expect(res2.body).toMatchObject(removeUndefined(irrigationPrescriptionsWithTasks));
      });
    });
  });

  describe('All users should be able to GET irrigation prescription details', () => {
    [1, 2, 3, 5].forEach((role) => {
      test(`User with role ${role} should request IP details`, async () => {
        const mockedEnsembleAPICall = ensembleAPICall as jest.Mock;

        const { farm, field, user } = await setupFarmEnvironment(role);

        const MOCK_ID = 123;
        await mockedEnsembleAPICall.mockResolvedValueOnce({
          data: await generateMockPrescriptionDetails({
            farm_id: farm.farm_id,
            irrigationPrescriptionId: MOCK_ID,
          }),
        });

        await connectFarmToEnsemble(farm);

        const res = await getIrrigationPrescriptionDetails({
          farm_id: farm.farm_id,
          user_id: user.user_id,
          shouldSend: 'true',
          irrigationPrescriptionId: MOCK_ID,
        });

        expect(mockedEnsembleAPICall).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'get',
            url: expect.stringContaining(`/irrigation_prescription/${MOCK_ID}`),
          }),
          expect.any(Function), // onError callback
        );

        expect(res.body).toMatchObject({
          id: MOCK_ID,
          location_id: field.location_id,
          management_plan_id: null,
          metadata: {
            weather_forecast: {
              // check units conversion
              temperature_unit: 'C',
            },
          },
        });
      });
    });
  });

  describe('Users should not be able to GET irrigation prescription details for an IP associated with a different farm', () => {
    [1, 2, 3, 5].forEach((role) => {
      test(`User with role ${role} should not be able to request IP details for a different farm`, async () => {
        const mockedEnsembleAPICall = ensembleAPICall as jest.Mock;

        const { farm: farm1 } = await setupFarmEnvironment(role);
        const { farm: farm2, user } = await setupFarmEnvironment(role);

        const MOCK_ID = 124;

        await mockedEnsembleAPICall.mockResolvedValueOnce({
          data: await generateMockPrescriptionDetails({
            farm_id: farm1.farm_id,
            irrigationPrescriptionId: MOCK_ID,
          }),
        });

        await connectFarmToEnsemble(farm1);
        await connectFarmToEnsemble(farm2);

        const res = await getIrrigationPrescriptionDetails({
          farm_id: farm2.farm_id,
          user_id: user.user_id,
          shouldSend: 'true',
          irrigationPrescriptionId: MOCK_ID,
        });

        expect(mockedEnsembleAPICall).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'get',
            url: expect.stringContaining(`/irrigation_prescription/${MOCK_ID}`),
          }),
          expect.any(Function), // onError callback
        );

        expect(res.status).toBe(403);
        expect(res.body).toMatchObject({
          error: `Irrigation prescription ${MOCK_ID} belongs to a different farm`,
        });
      });
    });
  });

  describe('Should return an error if Ensemble prescription is missing prescription data', () => {
    test("Returns 500 if 'prescription' key is missing", async () => {
      const mockedEnsembleAPICall = ensembleAPICall as jest.Mock;

      const { farm, user } = await setupFarmEnvironment(1);

      const MOCK_ID = 125;

      const irrigationPrescription = await generateMockPrescriptionDetails({
        farm_id: farm.farm_id,
        irrigationPrescriptionId: MOCK_ID,
      });

      const { prescription, ...invalidIrrigationPrescription } = irrigationPrescription;

      await mockedEnsembleAPICall.mockResolvedValueOnce({
        data: invalidIrrigationPrescription,
      });

      await connectFarmToEnsemble(farm);

      const res = await getIrrigationPrescriptionDetails({
        farm_id: farm.farm_id,
        user_id: user.user_id,
        shouldSend: 'true',
        irrigationPrescriptionId: MOCK_ID,
      });

      expect(mockedEnsembleAPICall).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: expect.stringContaining(`/irrigation_prescription/${MOCK_ID}`),
        }),
        expect.any(Function), // onError callback
      );

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        error: `Prescription data is missing`,
      });
    });
  });

  describe('Water consumption calculuation tests', () => {
    test('API should calculate water consumption for a VRI prescription', async () => {
      const mockedEnsembleAPICall = ensembleAPICall as jest.Mock;
      const mockedGetAreaOfPolygon = getAreaOfPolygon as jest.Mock;

      mockedGetAreaOfPolygon.mockReturnValue(100); // Mock area of each zone to 100 m²

      const { farm, user } = await setupFarmEnvironment(1);

      // Mock ID for VRI prescription (odd ID)
      const MOCK_ID = 123;

      await mockedEnsembleAPICall.mockResolvedValueOnce({
        data: await generateMockPrescriptionDetails({
          farm_id: farm.farm_id,
          irrigationPrescriptionId: MOCK_ID,
          applicationDepths: [5, 10, 15], // in mm
        }),
      });

      await connectFarmToEnsemble(farm);

      const res = await getIrrigationPrescriptionDetails({
        farm_id: farm.farm_id,
        user_id: user.user_id,
        shouldSend: 'true',
        irrigationPrescriptionId: MOCK_ID,
      });

      // Total Volume in L = Area (m²) * Depth (mm)
      const totalVolumeL = 100 * (5 + 10 + 15);

      expect(res.body).toMatchObject({
        id: MOCK_ID,
        estimated_water_consumption: totalVolumeL,
        estimated_water_consumption_unit: 'l',
      });
    });

    test('API should calculate water consumption for a URI prescription', async () => {
      const mockedEnsembleAPICall = ensembleAPICall as jest.Mock;

      const { farm, user } = await setupFarmEnvironment(1);

      // Mock ID for URI prescription (even ID)
      const MOCK_ID = 124;

      await mockedEnsembleAPICall.mockResolvedValueOnce({
        data: await generateMockPrescriptionDetails({
          farm_id: farm.farm_id,
          irrigationPrescriptionId: MOCK_ID,
          applicationDepths: [20], // in mm
          pivotRadius: 100, // in meters
        }),
      });

      await connectFarmToEnsemble(farm);

      const res = await getIrrigationPrescriptionDetails({
        farm_id: farm.farm_id,
        user_id: user.user_id,
        shouldSend: 'true',
        irrigationPrescriptionId: MOCK_ID,
      });

      // Pi * r² = Area of circle
      const pivotArea = Math.PI * Math.pow(100, 2); // in m²

      // Total Volume in L = Area (m²) * Depth (mm)
      const totalVolumeL = pivotArea * 20;

      expect(res.body).toMatchObject({
        id: MOCK_ID,
        estimated_water_consumption: totalVolumeL,
        estimated_water_consumption_unit: 'l',
      });
    });
  });
});
