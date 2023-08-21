/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (insightsAPI.test.js) is part of LiteFarm.
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
const chai_assert = chai.assert; // Using Assert style
const chai_expect = chai.expect; // Using Expect style
const chai_should = chai.should(); // Using Should style
import knex from '../src/util/knex.js';
import server from './../src/server.js';
import mocks from './mock.factories.js';
import { tableCleanup } from './testEnvironment.js';
import insightHelpers from '../src/controllers/insightHelpers.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import { faker } from '@faker-js/faker';
import moment from 'moment';
import insigntController from '../src/controllers/insightController';

xdescribe('insights test', () => {
  const emptyNutrients = { energy: 0, lipid: 0, protein: 0, vitc: 0, vita_rae: 0 };

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Soil Om', () => {
    test('Should get soil om if Im on my farm as an owner', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(1);
      getInsight(farm_id, user_id, 'soil_om', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get soil om if Im on my farm as a manager', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'soil_om', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });

    test('Should get soil om if Im on my farm as a worker', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      getInsight(farm_id, user_id, 'soil_om', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('labour happiness', () => {
    test('Should get labour happiness if Im on my farm as an owner', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(1);
      getInsight(farm_id, user_id, 'labour_happiness', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get labour happiness if Im on my farm as a manager', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'labour_happiness', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });

    test('Should get labour happiness if Im on my farm as a worker', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      getInsight(farm_id, user_id, 'labour_happiness', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('biodiversity', () => {
    test('Should get biodiversity if Im on my farm as an owner', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(1);
      getInsight(farm_id, user_id, 'biodiversity', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get biodiversity if Im on my farm as a manager', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'biodiversity', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });

    test('Should get biodiversity if Im on my farm as a worker', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      getInsight(farm_id, user_id, 'biodiversity', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('prices distance', () => {
    describe('Unit tests', () => {
      test('Distance between two coordinate test', async (done) => {
        expect(
          insightHelpers.distance(62.990967, -71.463767, 52.990967, -91.463767) - 1612.09,
        ).toBeLessThan(0.5);
        expect(
          insightHelpers.distance(-62.990967, 171.463767, -52.990967, 191.463767) - 1612.09,
        ).toBeLessThan(0.5);
        expect(insightHelpers.distance(62.990967, -71.463767, 62.990967, -71.463767)).toBe(0);
        done();
      });

      test('FormatPricesNearByData Test', async (done) => {
        const salesByCropsFarmIdMonth = [
          {
            year_month: '2020-12',
            crop_common_name: 'quaerat rerum fugiat',
            crop_translation_key: 'quaerat rerum fugiat',
            sale_quant: 793,
            sale_value: 98,
            farm_id: '87827ed7-5c36-11eb-b3aa-9f566fe0899e',
            grid_points: {
              lat: 62.990967,
              lng: -71.463767,
            },
          },
          {
            year_month: '2020-12',
            crop_common_name: 'quaerat rerum fugiat',
            crop_translation_key: 'quaerat rerum fugiat',
            sale_quant: 73,
            sale_value: 98,
            farm_id: '87827ed7-5c36-11eb-b3aa-9f566fe0899e',
            grid_points: {
              lat: 62.990967,
              lng: -71.463767,
            },
          },
          {
            year_month: '2020-12',
            crop_common_name: 'quaerat rerum fugiat',
            crop_translation_key: 'quaerat rerum fugiat',
            sale_quant: 182,
            sale_value: 607,
            farm_id: '8788ef8b-5c36-11eb-b3aa-9f566fe0899e',
            grid_points: {
              lat: 62.990967,
              lng: -71.553767,
            },
          },
          {
            year_month: '2020-12',
            crop_common_name: 'ullam molestiae doloribus',
            crop_translation_key: 'ullam molestiae doloribus',
            sale_quant: 618,
            sale_value: 600,
            farm_id: '87827ed7-5c36-11eb-b3aa-9f566fe0899e',
            grid_points: {
              lat: 62.990967,
              lng: -71.463767,
            },
          },
          {
            year_month: '2021-01',
            crop_common_name: 'quaerat rerum fugiat',
            crop_translation_key: 'quaerat rerum fugiat',
            sale_quant: 1258,
            sale_value: 770,
            farm_id: '8788ef8b-5c36-11eb-b3aa-9f566fe0899e',
            grid_points: {
              lat: 62.990967,
              lng: -71.553767,
            },
          },
        ];

        const farm1_id = '87827ed7-5c36-11eb-b3aa-9f566fe0899e';
        const farm2_id = '8788ef8b-5c36-11eb-b3aa-9f566fe0899e';

        const formatted1 = insightHelpers.formatPricesNearbyData(farm1_id, salesByCropsFarmIdMonth);
        const expected1 = {
          preview: 65,
          data: [
            {
              'quaerat rerum fugiat': [
                {
                  crop_date: '2020-12',
                  crop_price: 0.22632794457274827,
                  network_price: 0.7662213740458015,
                },
                {
                  crop_date: '2021-01',
                  crop_price: 0,
                  network_price: 0.6120826709062003,
                },
              ],
            },
            {
              'ullam molestiae doloribus': [
                {
                  crop_date: '2020-12',
                  crop_price: 0.970873786407767,
                  network_price: 0.970873786407767,
                },
              ],
            },
          ],
          amountOfFarms: 1,
        };

        expect(formatted1).toEqual(expected1);

        const formatted2 = insightHelpers.formatPricesNearbyData(farm2_id, salesByCropsFarmIdMonth);

        const expected2 = {
          preview: 268,
          data: [
            {
              'quaerat rerum fugiat': [
                {
                  crop_date: '2020-12',
                  crop_price: 3.335164835164835,
                  network_price: 0.7662213740458015,
                },
                {
                  crop_date: '2021-01',
                  crop_price: 0.6120826709062003,
                  network_price: 0.6120826709062003,
                },
              ],
            },
            {
              'ullam molestiae doloribus': [
                {
                  crop_date: '2020-12',
                  crop_price: 0,
                  network_price: 0.970873786407767,
                },
              ],
            },
          ],
          amountOfFarms: 1,
        };

        expect(formatted2).toEqual(expected2);
        done();
      });

      xtest('queryCropSalesNearByStartDateAndFarmId test', async (done) => {
        const startdate = moment('2020-12-01').format('YYYY-MM-DD');
        const gridPoint0 = { lat: 62.990967, lng: -71.463767 };
        const gridPoint5West = { lat: 62.990967, lng: -71.553767 };
        const gridPoint10West = { lat: 62.990967, lng: -71.653767 };
        const gridPoint15West = { lat: 62.990967, lng: -71.753767 };
        const gridPoint20West = { lat: 62.990967, lng: -71.853767 };
        const gridPoint25West = { lat: 62.990967, lng: -71.953767 };
        const gridPoint30West = { lat: 62.990967, lng: -72.053767 };
        const gridPoint5East = { lat: 62.990967, lng: -71.373767 };

        const gridPoints = [
          gridPoint0,
          gridPoint5West,
          gridPoint10West,
          gridPoint15West,
          gridPoint20West,
          gridPoint25West,
          gridPoint30West,
          gridPoint5East,
        ];
        const crops = [];
        for (let i = 0; i < 3; i++) {
          const [crop] = await mocks.cropFactory();
          await knex('crop').where({ crop_id: crop.crop_id }).update({ farm_id: null });
          crop.farm_id = null;
          crops.push(crop);
        }
        const crop0Sales = [];
        const crop1Sales = [];
        const crop2Sales = [];

        const farms = [];
        const fields = [];
        for (const grid_points of gridPoints) {
          const [farm] = await mocks.farmFactory({ ...mocks.fakeFarm(), grid_points });
          const [field] = await mocks.fieldFactory({ promisedFarm: [farm] });
          const [managementPlan] = await mocks.management_planFactory({
            promisedCrop: [crops[0]],
            promisedField: [field],
          });
          const [cropSale] = await mocks.cropSaleFactory({
            promisedManagementPlan: [managementPlan],
            promisedSale: mocks.saleFactory(
              { promisedFarm: [farm] },
              {
                ...mocks.fakeSale(),
                sale_date: moment('2020-12-01').format(),
              },
            ),
          });
          fields.push(field);
          farms.push(farm);
          crop0Sales.push(cropSale);
        }
        const crop12020Sales = [];
        for (let i = 0; i < 2; i++) {
          const [managementPlan1] = await mocks.management_planFactory({
            promisedField: [fields[i]],
            promisedCrop: [crops[1]],
          });
          const [crop1Sale] = await mocks.cropSaleFactory({
            promisedManagementPlan: [managementPlan1],
            promisedSale: mocks.saleFactory({ promisedFarm: [farms[i]] }),
          });
          const [crop11Sale] = await mocks.cropSaleFactory({
            promisedManagementPlan: [managementPlan1],
            promisedSale: mocks.saleFactory({ promisedFarm: [farms[i]] }),
          });
          const [crop12Sale] = await mocks.cropSaleFactory({
            promisedManagementPlan: [managementPlan1],
            promisedSale: mocks.saleFactory(
              { promisedFarm: [farms[i]] },
              {
                ...mocks.fakeSale(),
                sale_date: moment('2020-12-01').format(),
              },
            ),
          });
          crop12020Sales.push(crop12Sale);

          crop1Sales.push(crop1Sale);
          crop1Sales.push(crop11Sale);
          const [managementPlan2] = await mocks.management_planFactory({
            promisedField: [fields[i + 1]],
            promisedCrop: [crops[2]],
          });
          const [crop2Sale] = await mocks.cropSaleFactory({
            promisedManagementPlan: [managementPlan2],
            promisedSale: mocks.saleFactory({ promisedFarm: [farms[i + 1]] }),
          });
          crop2Sales.push(crop2Sale);
        }
        const [{ user_id, farm_id }] = await mocks.userFarmFactory(
          { promisedFarm: [farms[0]] },
          { ...mocks.fakeUserFarm(), role_id: 1 },
        );

        const {
          rows: salesOfAFarm2020,
        } = await insigntController.queryCropSalesNearByStartDateAndFarmId(startdate, farm_id);
        expect(salesOfAFarm2020.length).toBe(14);
        const {
          rows: salesOfAFarmCurrentYear,
        } = await insigntController.queryCropSalesNearByStartDateAndFarmId(
          moment().format('YYYY-MM-DD'),
          farm_id,
        );
        expect(salesOfAFarmCurrentYear.length).toBe(2);
        const getQuery = (distance) => ({
          distance,
          lat: gridPoint0.lat,
          long: gridPoint0.lng,
          startdate,
        });

        getInsightWithQuery(farm_id, user_id, 'prices/distance', getQuery(5), (err, res) => {
          expect(res.status).toBe(200);
          const crop0CommonName = crops[0].crop_common_name;
          const crop0TotalPrice =
            crop0Sales[0].sale_value + crop0Sales[1].sale_value + crop0Sales[7].sale_value;
          const crop0TotalQuantity =
            crop0Sales[0].quantity + crop0Sales[1].quantity + crop0Sales[7].quantity;

          const crop1CommonName = crops[1].crop_common_name;
          const crop1TotalPrice =
            crop1Sales[0].sale_value +
            crop1Sales[1].sale_value +
            crop1Sales[2].sale_value +
            crop1Sales[3].sale_value;
          const crop1TotalQuantity =
            crop1Sales[0].quantity +
            crop1Sales[1].quantity +
            crop1Sales[2].quantity +
            crop1Sales[3].quantity;

          const crop12020CommonName = crops[1].crop_common_name;
          const crop12020TotalPrice = crop12020Sales[0].sale_value + crop12020Sales[1].sale_value;
          const crop12020TotalQuantity = crop12020Sales[0].quantity + crop12020Sales[1].quantity;
          const data = res.body.data;
          for (const cropSaleRes of data) {
            if (cropSaleRes[crop0CommonName]) {
              expect(cropSaleRes[crop0CommonName][0].crop_date).toBe(
                moment('2020-12-01').format('YYYY-MM'),
              );
              expect(
                cropSaleRes[crop0CommonName][0].crop_price -
                  crop0Sales[0].sale_value / crop0Sales[0].quantity,
              ).toBeLessThan(0.01);
              expect(
                cropSaleRes[crop0CommonName][0].network_price -
                  crop0TotalPrice / crop0TotalQuantity,
              ).toBeLessThan(0.01);
            } else if (cropSaleRes[crop1CommonName]) {
              expect(cropSaleRes[crop1CommonName][0].crop_date).toBe(
                moment('2020-12-01').format('YYYY-MM'),
              );
              expect(
                cropSaleRes[crop1CommonName][0].crop_price -
                  crop12020Sales[0].sale_value / crop12020Sales[0].quantity,
              ).toBeLessThan(0.01);
              expect(
                cropSaleRes[crop1CommonName][0].network_price -
                  crop12020TotalPrice / crop12020TotalQuantity,
              ).toBeLessThan(0.01);
              expect(cropSaleRes[crop1CommonName][1].crop_date).toBe(moment().format('YYYY-MM'));
              expect(
                cropSaleRes[crop1CommonName][1].crop_price -
                  (crop1Sales[0].sale_value + crop1Sales[1].sale_value) /
                    (crop1Sales[0].quantity + crop1Sales[1].quantity),
              ).toBeLessThan(0.01);
              expect(
                cropSaleRes[crop1CommonName][1].network_price -
                  crop1TotalPrice / crop1TotalQuantity,
              ).toBeLessThan(0.01);
            }
          }

          getInsightWithQuery(farm_id, user_id, 'prices/distance', getQuery(10), (err, res) => {
            expect(res.status).toBe(200);
            const crop0CommonName = crops[0].crop_common_name;
            const crop0TotalPrice =
              crop0Sales[0].sale_value +
              crop0Sales[1].sale_value +
              crop0Sales[2].sale_value +
              crop0Sales[7].sale_value;
            const crop0TotalQuantity =
              crop0Sales[0].quantity +
              crop0Sales[1].quantity +
              crop0Sales[2].quantity +
              crop0Sales[7].quantity;
            const data = res.body.data;
            for (const cropSaleRes of data) {
              if (cropSaleRes[crop0CommonName]) {
                expect(cropSaleRes[crop0CommonName][0].crop_date).toBe(
                  moment('2020-12-01').format('YYYY-MM'),
                );
                expect(
                  cropSaleRes[crop0CommonName][0].crop_price -
                    crop0Sales[0].sale_value / crop0Sales[0].quantity,
                ).toBeLessThan(0.01);
                expect(
                  cropSaleRes[crop0CommonName][0].network_price -
                    crop0TotalPrice / crop0TotalQuantity,
                ).toBeLessThan(0.01);
              }
            }
            done();
          });
        });
      });
    });

    test('Should get prices distance if Im on my farm as an owner', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(1);
      const query = mocks.fakePriceInsightForTests();

      getInsightWithQuery(farm_id, user_id, 'prices/distance', query, (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get prices distance if Im on my farm as a manager', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      const query = mocks.fakePriceInsightForTests();
      getInsightWithQuery(farm_id, user_id, 'prices/distance', query, (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });

    test('Should get prices distance if Im on my farm as a worker', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      const query = mocks.fakePriceInsightForTests();
      getInsightWithQuery(farm_id, user_id, 'prices/distance', query, (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });
});

function createUserFarm(role) {
  return mocks.userFarmFactory(
    {
      promisedFarm: mocks.farmFactory(),
      promisedUser: mocks.usersFactory(),
    },
    { role_id: role, status: 'Active' },
  );
}

function getInsight(farmId, userId, route, callback) {
  chai
    .request(server)
    .get(`/insight/${route}/${farmId}`)
    .set('farm_id', farmId)
    .set('user_id', userId)
    .end(callback);
}

function getInsightWithQuery(farmId, userId, route, query, callback) {
  chai
    .request(server)
    .get(
      `/insight/${route}/${farmId}?distance=${query.distance}&lat=${query.lat}&long=${
        query.long
      }&startdate=${query.startdate || '2020-1-1'}`,
    )
    .set('farm_id', farmId)
    .set('user_id', userId)
    .end(callback);
}
