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

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const chai_assert = chai.assert;    // Using Assert style
const chai_expect = chai.expect;    // Using Expect style
const chai_should = chai.should();  // Using Should style
const knex = require('../src/util/knex');
const server = require('./../src/server');
const mocks = require('./mock.factories');
const { tableCleanup } = require('./testEnvironment');
const insightHelpers = require('../src/controllers/insightHelpers.js');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
let faker = require('faker');
const moment = require('moment');
const insigntController = require('../src/controllers/insightController');

describe('insights test', () => {
  let middleware;
  const emptyNutrients = { energy: 0, lipid: 0, protein: 0, vitc: 0, vita_rae: 0 };

  beforeAll(() => {
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next();
    });
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('People Fed', () => {

    async function generateSaleData(crop, quantity, user) {
      const [{ user_id, farm_id }] = user ? user : await createUserFarm(1);
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const { location_id, created_by_user_id } = location;
      const [field] = await mocks.fieldFactory({ promisedLocation: [location] });
      const [{ crop_id }] = await mocks.cropFactory({ promisedFarm: [{ farm_id }] }, crop);
      const [{ field_crop_id }] = await mocks.fieldCropFactory({
        promisedLocation: [location],
        promisedField: [field],
        promisedCrop: [{ crop_id }],
      });
      const [{ sale_id }] = await mocks.saleFactory({ promisedUserFarm: [{ user_id, farm_id }] });
      const [{ crop_sale_id }] = await mocks.cropSaleFactory({
          promisedCrop: [{ crop_id }],
          promisedSale: [{ sale_id }],
        },
        { quantity_kg: quantity, sale_value: 3 });
      return { user_id, farm_id, field_crop_id };
    }

    test('Should get people fed if Im on my farm as an owner', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(1);
      getInsight(farm_id, user_id, 'people_fed', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get people fed if Im on my farm as a manager', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'people_fed', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });

    test('Should get people fed if Im on my farm as a worker', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      getInsight(farm_id, user_id, 'people_fed', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });

    describe('Meals calculation', () => {
      afterEach(async () => {
        await knex.raw('DELETE FROM "harvestUseType"');
      });
      test('Should get 9 meals in calories from a crop with 250 calories and 3kg sale', async (done) => {
        const { user_id, farm_id } = await generateSaleData({
          ...mocks.fakeCrop(),
          percentrefuse: 0, ...emptyNutrients,
          energy: 250,
        }, 3);
        getInsight(farm_id, user_id, 'people_fed', (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.preview).toBeGreaterThan(0);
          const cals = res.body.data.find(({ label }) => label === 'Calories');
          expect(cals.val).toBe(9);
          done();
        });
      });

      test('Should get 9 meals in calories from a crop with 250 calories and 1kg sale and 2 kg harvest log', async (done) => {
        const { user_id, farm_id, field_crop_id } = await generateSaleData({
          ...mocks.fakeCrop(),
          percentrefuse: 0, ...emptyNutrients,
          energy: 250,
        }, 1);
        const harvestUseType = await mocks.harvestUseTypeFactory({}, {
          harvest_use_type_id: 2,
          harvest_use_type_name: 'test',
        });
        await mocks.harvestUseFactory({
            promisedFieldCrop: [{ field_crop_id }],
            promisedHarvestUseType: harvestUseType,
          },
          { quantity_kg: 2 });
        getInsight(farm_id, user_id, 'people_fed', (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.preview).toBeGreaterThan(0);
          const cals = res.body.data.find(({ label }) => label === 'Calories');
          expect(cals.val).toBe(9);
          done();
        });
      });

      test('Should get 9 meals in protein from a crop with 5.2g protein 1kg sale and 2 kg harvest log', async (done) => {
        const { user_id, farm_id, field_crop_id } = await generateSaleData({
          ...mocks.fakeCrop(),
          percentrefuse: 0, ...emptyNutrients,
          protein: 5.2,
        }, 1);
        const harvestUseType = await mocks.harvestUseTypeFactory({}, {
          harvest_use_type_id: 2,
          harvest_use_type_name: 'test',
        });
        await mocks.harvestUseFactory({
            promisedFieldCrop: [{ field_crop_id }],
            promisedHarvestUseType: harvestUseType,
          },
          { quantity_kg: 2 });
        getInsight(farm_id, user_id, 'people_fed', (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.preview).toBeGreaterThan(0);
          const cals = res.body.data.find(({ label }) => label === 'Protein');
          expect(cals.val).toBe(9);
          done();
        });
      });

      test('Should get 9 meals in fat from a crop with 75g fat 1kg sale and 2 kg harvest log', async (done) => {
        const { user_id, farm_id, field_crop_id } = await generateSaleData({
          ...mocks.fakeCrop(),
          percentrefuse: 0, ...emptyNutrients,
          lipid: 75,
        }, 1);
        const harvestUseType = await mocks.harvestUseTypeFactory({}, {
          harvest_use_type_id: 2,
          harvest_use_type_name: 'test',
        });
        await mocks.harvestUseFactory({
            promisedFieldCrop: [{ field_crop_id }],
            promisedHarvestUseType: harvestUseType,
          },
          { quantity_kg: 2 });
        getInsight(farm_id, user_id, 'people_fed', (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.preview).toBeGreaterThan(0);
          const cals = res.body.data.find(({ label }) => label === 'Fat');
          expect(cals.val).toBe(9);
          done();
        });
      });

      test('Should get 9 meals in vitamin c from a crop with 9g vitamin c 1kg sale and 2 kg harvest log', async (done) => {
        const { user_id, farm_id, field_crop_id } = await generateSaleData({
          ...mocks.fakeCrop(),
          percentrefuse: 0, ...emptyNutrients,
          vitc: 9,
        }, 1);
        const harvestUseType = await mocks.harvestUseTypeFactory({}, {
          harvest_use_type_id: 2,
          harvest_use_type_name: 'test',
        });
        await mocks.harvestUseFactory({
            promisedFieldCrop: [{ field_crop_id }],
            promisedHarvestUseType: harvestUseType,
          },
          { quantity_kg: 2 });
        getInsight(farm_id, user_id, 'people_fed', (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.preview).toBeGreaterThan(0);
          const cals = res.body.data.find(({ label }) => label === 'Vitamin C');
          expect(cals.val).toBe(9);
          done();
        });
      });

      test('Should get 9 meals in vitamin A from a crop with 90g vitamin a 1kg sale and 2 kg harvest log', async (done) => {
        const { user_id, farm_id, field_crop_id } = await generateSaleData({
          ...mocks.fakeCrop(),
          percentrefuse: 0, ...emptyNutrients,
          vita_rae: 90,
        }, 1);
        const harvestUseType = await mocks.harvestUseTypeFactory({}, {
          harvest_use_type_id: 2,
          harvest_use_type_name: 'test',
        });
        await mocks.harvestUseFactory({
            promisedFieldCrop: [{ field_crop_id }],
            promisedHarvestUseType: harvestUseType,
          },
          { quantity_kg: 2 });
        getInsight(farm_id, user_id, 'people_fed', (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.preview).toBeGreaterThan(0);
          const cals = res.body.data.find(({ label }) => label === 'Vitamin A');
          expect(cals.val).toBe(9);
          done();
        });
      });

      test('Should get average of 9 meals with 3 kg sales of crops that generate 9 meals themselves', async (done) => {
        const { user_id, farm_id } = await generateSaleData({
          ...mocks.fakeCrop(),
          percentrefuse: 0, ...emptyNutrients,
          energy: 250,
        }, 3);
        await generateSaleData({
          ...mocks.fakeCrop(),
          percentrefuse: 0, ...emptyNutrients,
          protein: 5.2,
        }, 3, [{ user_id, farm_id }]);
        await generateSaleData({ ...mocks.fakeCrop(), percentrefuse: 0, ...emptyNutrients, lipid: 75 }, 3, [{
          user_id,
          farm_id,
        }]);
        await generateSaleData({ ...mocks.fakeCrop(), percentrefuse: 0, ...emptyNutrients, vitc: 9 }, 3, [{
          user_id,
          farm_id,
        }]);
        await generateSaleData({
          ...mocks.fakeCrop(),
          percentrefuse: 0, ...emptyNutrients,
          vita_rae: 90,
        }, 3, [{ user_id, farm_id }]);
        getInsight(farm_id, user_id, 'people_fed', (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.preview).toBe(9);
          done();
        });
      });


      test('Should get no meals in preview from a crop with no sales and no harvests', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        getInsight(farm_id, user_id, 'people_fed', (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.preview).toBe(0);
          done();
        });
      });

    });


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
        expect(insightHelpers.distance(62.990967, -71.463767, 52.990967, -91.463767) - 1612.09).toBeLessThan(0.5);
        expect(insightHelpers.distance(-62.990967, 171.463767, -52.990967, 191.463767) - 1612.09).toBeLessThan(0.5);
        expect(insightHelpers.distance(62.990967, -71.463767, 62.990967, -71.463767)).toBe(0);
        done();
      });

      test('FormatPricesNearByData Test', async (done) => {
        const salesByCropsFarmIdMonth = [
          {
            'year_month': '2020-12',
            'crop_common_name': 'quaerat rerum fugiat',
            'crop_translation_key': 'quaerat rerum fugiat',
            'sale_quant': 793,
            'sale_value': 98,
            'farm_id': '87827ed7-5c36-11eb-b3aa-9f566fe0899e',
            'grid_points': {
              'lat': 62.990967,
              'lng': -71.463767,
            },
          },
          {
            'year_month': '2020-12',
            'crop_common_name': 'quaerat rerum fugiat',
            'crop_translation_key': 'quaerat rerum fugiat',
            'sale_quant': 73,
            'sale_value': 98,
            'farm_id': '87827ed7-5c36-11eb-b3aa-9f566fe0899e',
            'grid_points': {
              'lat': 62.990967,
              'lng': -71.463767,
            },
          },
          {
            'year_month': '2020-12',
            'crop_common_name': 'quaerat rerum fugiat',
            'crop_translation_key': 'quaerat rerum fugiat',
            'sale_quant': 182,
            'sale_value': 607,
            'farm_id': '8788ef8b-5c36-11eb-b3aa-9f566fe0899e',
            'grid_points': {
              'lat': 62.990967,
              'lng': -71.553767,
            },
          },
          {
            'year_month': '2020-12',
            'crop_common_name': 'ullam molestiae doloribus',
            'crop_translation_key': 'ullam molestiae doloribus',
            'sale_quant': 618,
            'sale_value': 600,
            'farm_id': '87827ed7-5c36-11eb-b3aa-9f566fe0899e',
            'grid_points': {
              'lat': 62.990967,
              'lng': -71.463767,
            },
          },
          {
            'year_month': '2021-01',
            'crop_common_name': 'quaerat rerum fugiat',
            'crop_translation_key': 'quaerat rerum fugiat',
            'sale_quant': 1258,
            'sale_value': 770,
            'farm_id': '8788ef8b-5c36-11eb-b3aa-9f566fe0899e',
            'grid_points': {
              'lat': 62.990967,
              'lng': -71.553767,
            },
          },
        ];

        const farm1_id = '87827ed7-5c36-11eb-b3aa-9f566fe0899e';
        const farm2_id = '8788ef8b-5c36-11eb-b3aa-9f566fe0899e';

        const formatted1 = insightHelpers.formatPricesNearbyData(farm1_id, salesByCropsFarmIdMonth);
        const expected1 = {
          'preview': 65,
          'data': [
            {
              'quaerat rerum fugiat': [
                {
                  'crop_date': '2020-12',
                  'crop_price': 0.22632794457274827,
                  'network_price': 0.7662213740458015,
                },
                {
                  'crop_date': '2021-01',
                  'crop_price': 0,
                  'network_price': 0.6120826709062003,
                },
              ],
            },
            {
              'ullam molestiae doloribus': [
                {
                  'crop_date': '2020-12',
                  'crop_price': 0.970873786407767,
                  'network_price': 0.970873786407767,
                },
              ],
            },
          ],
          'amountOfFarms': 1,
        };

        expect(formatted1).toEqual(expected1);

        const formatted2 = insightHelpers.formatPricesNearbyData(farm2_id, salesByCropsFarmIdMonth);

        const expected2 = {
          'preview': 268,
          'data': [
            {
              'quaerat rerum fugiat': [
                {
                  'crop_date': '2020-12',
                  'crop_price': 3.335164835164835,
                  'network_price': 0.7662213740458015,
                },
                {
                  'crop_date': '2021-01',
                  'crop_price': 0.6120826709062003,
                  'network_price': 0.6120826709062003,
                },
              ],
            },
            {
              'ullam molestiae doloribus': [
                {
                  'crop_date': '2020-12',
                  'crop_price': 0,
                  'network_price': 0.970873786407767,
                },
              ],
            },
          ],
          'amountOfFarms': 1,
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

        const gridPoints = [gridPoint0, gridPoint5West, gridPoint10West, gridPoint15West, gridPoint20West, gridPoint25West, gridPoint30West, gridPoint5East];
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
          const [fieldCrop] = await mocks.fieldCropFactory({ promisedCrop: [crops[0]], promisedField: [field] });
          const [cropSale] = await mocks.cropSaleFactory({
            promisedFieldCrop: [fieldCrop],
            promisedSale: mocks.saleFactory({ promisedFarm: [farm] }, {
              ...mocks.fakeSale(),
              sale_date: moment('2020-12-01').format(),
            }),
          });
          fields.push(field);
          farms.push(farm);
          crop0Sales.push(cropSale);
        }
        const crop12020Sales = [];
        for (let i = 0; i < 2; i++) {
          const [fieldCrop1] = await mocks.fieldCropFactory({ promisedField: [fields[i]], promisedCrop: [crops[1]] });
          const [crop1Sale] = await mocks.cropSaleFactory({
            promisedFieldCrop: [fieldCrop1],
            promisedSale: mocks.saleFactory({ promisedFarm: [farms[i]] }),
          });
          const [crop11Sale] = await mocks.cropSaleFactory({
            promisedFieldCrop: [fieldCrop1],
            promisedSale: mocks.saleFactory({ promisedFarm: [farms[i]] }),
          });
          const [crop12Sale] = await mocks.cropSaleFactory({
            promisedFieldCrop: [fieldCrop1],
            promisedSale: mocks.saleFactory({ promisedFarm: [farms[i]] }, {
              ...mocks.fakeSale(),
              sale_date: moment('2020-12-01').format(),
            }),
          });
          crop12020Sales.push(crop12Sale);

          crop1Sales.push(crop1Sale);
          crop1Sales.push(crop11Sale);
          const [fieldCrop2] = await mocks.fieldCropFactory({
            promisedField: [fields[i + 1]],
            promisedCrop: [crops[2]],
          });
          const [crop2Sale] = await mocks.cropSaleFactory({
            promisedFieldCrop: [fieldCrop2],
            promisedSale: mocks.saleFactory({ promisedFarm: [farms[i + 1]] }),
          });
          crop2Sales.push(crop2Sale);
        }
        const [{
          user_id,
          farm_id,
        }] = await mocks.userFarmFactory({ promisedFarm: [farms[0]] }, { ...mocks.fakeUserFarm(), role_id: 1 });

        const { rows: salesOfAFarm2020 } = await insigntController.queryCropSalesNearByStartDateAndFarmId(startdate, farm_id);
        expect(salesOfAFarm2020.length).toBe(14);
        const { rows: salesOfAFarmCurrentYear } = await insigntController.queryCropSalesNearByStartDateAndFarmId(moment().format('YYYY-MM-DD'), farm_id);
        expect(salesOfAFarmCurrentYear.length).toBe(2);
        const getQuery = (distance) => ({
          distance: distance,
          lat: gridPoint0.lat,
          long: gridPoint0.lng,
          startdate,
        });

        getInsightWithQuery(farm_id, user_id, 'prices/distance', getQuery(5), (err, res) => {
          expect(res.status).toBe(200);
          const crop0CommonName = crops[0].crop_common_name;
          const crop0TotalPrice = crop0Sales[0].sale_value + crop0Sales[1].sale_value + crop0Sales[7].sale_value;
          const crop0TotalQuantity = crop0Sales[0].quantity_kg + crop0Sales[1].quantity_kg + crop0Sales[7].quantity_kg;

          const crop1CommonName = crops[1].crop_common_name;
          const crop1TotalPrice = crop1Sales[0].sale_value + crop1Sales[1].sale_value + crop1Sales[2].sale_value + crop1Sales[3].sale_value;
          const crop1TotalQuantity = crop1Sales[0].quantity_kg + crop1Sales[1].quantity_kg + crop1Sales[2].quantity_kg + crop1Sales[3].quantity_kg;

          const crop12020CommonName = crops[1].crop_common_name;
          const crop12020TotalPrice = crop12020Sales[0].sale_value + crop12020Sales[1].sale_value;
          const crop12020TotalQuantity = crop12020Sales[0].quantity_kg + crop12020Sales[1].quantity_kg;
          const data = res.body.data;
          for(const cropSaleRes of data){
            if(cropSaleRes[crop0CommonName]){
              expect(cropSaleRes[crop0CommonName][0].crop_date).toBe(moment('2020-12-01').format('YYYY-MM'));
              expect(cropSaleRes[crop0CommonName][0].crop_price - crop0Sales[0].sale_value/crop0Sales[0].quantity_kg).toBeLessThan(0.01);
              expect(cropSaleRes[crop0CommonName][0].network_price - crop0TotalPrice/crop0TotalQuantity).toBeLessThan(0.01);
            }else if(cropSaleRes[crop1CommonName]){
              expect(cropSaleRes[crop1CommonName][0].crop_date).toBe(moment('2020-12-01').format('YYYY-MM'));
              expect(cropSaleRes[crop1CommonName][0].crop_price - crop12020Sales[0].sale_value/crop12020Sales[0].quantity_kg ).toBeLessThan(0.01);
              expect(cropSaleRes[crop1CommonName][0].network_price - crop12020TotalPrice/crop12020TotalQuantity).toBeLessThan(0.01);
              expect(cropSaleRes[crop1CommonName][1].crop_date).toBe(moment().format('YYYY-MM'));
              expect(cropSaleRes[crop1CommonName][1].crop_price - (crop1Sales[0].sale_value + crop1Sales[1].sale_value)/(crop1Sales[0].quantity_kg + crop1Sales[1].quantity_kg) ).toBeLessThan(0.01);
              expect(cropSaleRes[crop1CommonName][1].network_price - crop1TotalPrice/crop1TotalQuantity).toBeLessThan(0.01);
            }

          }

          getInsightWithQuery(farm_id, user_id, 'prices/distance', getQuery(10), (err, res) => {
            expect(res.status).toBe(200);
            const crop0CommonName = crops[0].crop_common_name;
            const crop0TotalPrice = crop0Sales[0].sale_value + crop0Sales[1].sale_value + crop0Sales[2].sale_value + crop0Sales[7].sale_value;
            const crop0TotalQuantity = crop0Sales[0].quantity_kg + crop0Sales[1].quantity_kg + crop0Sales[2].quantity_kg + crop0Sales[7].quantity_kg;
            const data = res.body.data;
            for(const cropSaleRes of data){
              if(cropSaleRes[crop0CommonName]){
                expect(cropSaleRes[crop0CommonName][0].crop_date).toBe(moment('2020-12-01').format('YYYY-MM'));
                expect(cropSaleRes[crop0CommonName][0].crop_price - crop0Sales[0].sale_value/crop0Sales[0].quantity_kg ).toBeLessThan(0.01);
                expect(cropSaleRes[crop0CommonName][0].network_price - crop0TotalPrice/crop0TotalQuantity).toBeLessThan(0.01);
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

  describe('waterbalance', () => {
    describe('GET', () => {
      test('Should get waterbalance if Im on my farm as an owner', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        getInsight(farm_id, user_id, 'waterbalance', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
      test('Should get waterbalance if Im on my farm as a manager', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        getInsight(farm_id, user_id, 'waterbalance', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });

      test('Should get waterbalance if Im on my farm as a worker', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        getInsight(farm_id, user_id, 'waterbalance', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
    });

    describe('POST', () => {
      test('should create a water balance if Im on my farm as an owner', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        const [field] = await mocks.fieldFactory({ promisedFarm: [{ farm_id }] });
        const [{ crop_id, location_id }] = await mocks.fieldCropFactory({ promisedField: [field] });
        const waterBalance = { ...mocks.fakeWaterBalance(), crop_id, field_id: location_id };
        postWaterBalance(waterBalance, { farm_id, user_id }, (err, res) => {
          expect(res.status).toBe(201);
          done();
        });
      });

      test('should create a water balance if Im on my farm as a manager', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        const [field] = await mocks.fieldFactory({ promisedFarm: [{ farm_id }] });
        const [{ crop_id, location_id }] = await mocks.fieldCropFactory({ promisedField: [field] });
        const waterBalance = { ...mocks.fakeWaterBalance(), crop_id, field_id: location_id };
        postWaterBalance(waterBalance, { farm_id, user_id }, (err, res) => {
          expect(res.status).toBe(201);
          done();
        });
      });

      test('should fail to create  a water balance if Im on my farm as a Worker', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        const [field] = await mocks.fieldFactory({ promisedFarm: [{ farm_id }] });
        const [{ crop_id, location_id }] = await mocks.fieldCropFactory({ promisedField: [field] });
        const waterBalance = { ...mocks.fakeWaterBalance(), crop_id, field_id: location_id };
        postWaterBalance(waterBalance, { farm_id, user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });


    });
  });

  describe('waterbalance schedule', () => {
    describe('GET', () => {
      test('Should get waterbalance schedule if Im on my farm as an owner', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        getInsight(farm_id, user_id, 'waterbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
      test('Should get waterbalance schedule if Im on my farm as a manager', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        getInsight(farm_id, user_id, 'waterbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
      test('Should get waterbalance schedule if Im on my farm as a worker', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        getInsight(farm_id, user_id, 'waterbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
    });
    describe('POST', () => {
      test('Should register my farm to the water balance schedule as an owner', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        postWaterBalanceSchedule({ farm_id, user_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const schedule = await knex('waterBalanceSchedule').where({ farm_id }).first();
          expect(schedule.farm_id).toBe(farm_id);
          done();
        });
      });
      test('Should register my farm to the water balance schedule as a manager', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        postWaterBalanceSchedule({ farm_id, user_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const schedule = await knex('waterBalanceSchedule').where({ farm_id }).first();
          expect(schedule.farm_id).toBe(farm_id);
          done();
        });
      });

      test('Should fail to register my farm to the water balance schedule as a worker', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        postWaterBalanceSchedule({ farm_id, user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

    });
  });

  describe('nitrogenbalance', () => {
    test('Should get nitrogenbalance if Im on my farm as an owner', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(1);
      getInsight(farm_id, user_id, 'nitrogenbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get nitrogenbalance if Im on my farm as a manager', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'nitrogenbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });

    test('Should get nitrogenbalance if Im on my farm as a worker', async (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      getInsight(farm_id, user_id, 'nitrogenbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('nitrogenbalance schedule', () => {
    describe('GET', () => {
      test('Should get nitrogenbalance schedule if Im on my farm as an owner', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        getInsight(farm_id, user_id, 'nitrogenbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });

      test('Should get nitrogenbalance schedule if Im on my farm as a manager', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        getInsight(farm_id, user_id, 'nitrogenbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });

      test('Should get nitrogenbalance schedule if Im on my farm as a worker', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        getInsight(farm_id, user_id, 'nitrogenbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
    });

    describe('POST', () => {
      test('should create nitrogen balance schedule if Im on my farm as an owner', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        const nitrogenSchedule = { ...mocks.fakeNitrogenSchedule(), farm_id };
        postNitrogenSchedule(nitrogenSchedule, { farm_id, user_id }, (err, res) => {
          expect(res.status).toBe(201);
          done();
        });
      });

      test('should createnitrogen balance if Im on my farm as a manager', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        const nitrogenSchedule = { ...mocks.fakeNitrogenSchedule(), farm_id };
        postNitrogenSchedule(nitrogenSchedule, { farm_id, user_id }, (err, res) => {
          expect(res.status).toBe(201);
          done();
        });
      });

      test('should fail to create nitrogen balance if Im on my farm as a Worker', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        const nitrogenSchedule = { ...mocks.fakeNitrogenSchedule(), farm_id };
        postNitrogenSchedule(nitrogenSchedule, { farm_id, user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });


    });

    describe('DELETE', () => {
      test('should delete nitrogen balance schedule if Im on my farm as an owner', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        const [schedule] = await mocks.nitrogenScheduleFactory({ promisedFarm: [{ farm_id }] });
        deleteNitrogenSchedule({ user_id, farm_id }, schedule.nitrogen_schedule_id, (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });

      test('should delete nitrogen balance schedule if Im on my farm as a manager', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        const [schedule] = await mocks.nitrogenScheduleFactory({ promisedFarm: [{ farm_id }] });
        deleteNitrogenSchedule({ user_id, farm_id }, schedule.nitrogen_schedule_id, (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });

      test('should fail to delete nitrogen balance schedule if Im on my farm as a worker', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        const [schedule] = await mocks.nitrogenScheduleFactory({ promisedFarm: [{ farm_id }] });
        deleteNitrogenSchedule({ user_id, farm_id }, schedule.nitrogen_schedule_id, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });
    });
  });

});

function createUserFarm(role) {
  return mocks.userFarmFactory({
    promisedFarm: mocks.farmFactory(),
    promisedUser: mocks.usersFactory(),
  }, { role_id: role, status: 'Active' });
}

function getInsight(farmId, userId, route, callback) {
  chai.request(server).get(`/insight/${route}/${farmId}`)
    .set('farm_id', farmId)
    .set('user_id', userId)
    .end(callback);
}

function getInsightWithQuery(farmId, userId, route, query, callback) {
  chai.request(server).get(`/insight/${route}/${farmId}?distance=${query.distance}&lat=${query.lat}&long=${query.long}&startdate=${query.startdate || '2020-1-1'}`)
    .set('farm_id', farmId)
    .set('user_id', userId)
    .end(callback);
}

function postWaterBalance(data, { farm_id, user_id }, callback) {
  chai.request(server).post(`/insight/waterbalance`)
    .set('farm_id', farm_id)
    .set('user_id', user_id)
    .send(data)
    .end(callback);
}

function postNitrogenSchedule(data, { farm_id, user_id }, callback) {
  chai.request(server).post('/insight/nitrogenbalance/schedule')
    .set('farm_id', farm_id)
    .set('user_id', user_id)
    .send(data)
    .end(callback);
}

function postWaterBalanceSchedule({ farm_id, user_id }, callback) {
  chai.request(server).post(`/insight/waterbalance/schedule`)
    .set('farm_id', farm_id)
    .set('user_id', user_id)
    .send({ farm_id })
    .end(callback);
}

function deleteNitrogenSchedule({ farm_id, user_id }, nitrogenId, callback) {
  chai.request(server).delete(`/insight/nitrogenbalance/schedule/${nitrogenId}`)
    .set('farm_id', farm_id)
    .set('user_id', user_id)
    .end(callback);
}
