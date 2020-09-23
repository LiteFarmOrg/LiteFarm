/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farm.test.js) is part of LiteFarm.
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
const moment = require('moment');
chai.use(chaiHttp);
const server = require('./../src/server');
const Knex = require('knex');
const environment = 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
jest.mock('../src/jobs/station_sync/mapping');
const mocks = require('./mock.factories');

const priceModel = require('../src/models/priceModel');

describe('Price Tests', () => {
	let middleware;
	let farm;
	let newOwner;

	beforeAll(() => {
		token = global.token;
	});

	// FUNCTIONS

	function postPriceRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
		chai
			.request(server)
			.post('/price')
			.set('Content-Type', 'application/json')
			.set('user_id', user_id)
			.set('farm_id', farm_id)
			.send(data)
			.end(callback);
	}

	function fakeUserFarm(role = 1) {
		return { ...mocks.fakeUserFarm(), role_id: role };
	}

	async function returnUserFarms(role) {
		const [ mainFarm ] = await mocks.farmFactory();
		const [ user ] = await mocks.usersFactory();
		const [ userFarm ] = await mocks.userFarmFactory(
			{
				promisedUser: [ user ],
				promisedFarm: [ mainFarm ]
			},
			fakeUserFarm(role)
		);
		return { mainFarm, user };
	}

	function getFakePrice(crop_id, farm_id) {
		const price = mocks.fakePrice();
		return { ...price, crop_id, farm_id };
	}

	async function returnPrice(mainFarm) {
		const [ crop ] = await mocks.cropFactory({ promisedFarm: [ mainFarm ] });
		const [ price ] = await mocks.yieldFactory({ promisedCrop: [ crop ] });
		return { price };
	}

	async function returnCrop(mainFarm) {
		const [ crop ] = await mocks.cropFactory({ promisedFarm: [ mainFarm ] });
		return { crop };
	}

	beforeEach(async () => {
		[ farm ] = await mocks.farmFactory();
		[ newOwner ] = await mocks.usersFactory();
		[ crop ] = await mocks.cropFactory({ promisedFarm: [ farm ] });

		middleware = require('../src/middleware/acl/checkJwt');
		middleware.mockImplementation((req, res, next) => {
			req.user = {};
			req.user.sub = '|' + req.get('user_id');
			next();
		});
	});

	afterEach(async () => {
		await tableCleanup(knex);
	});

	// POST TESTS

	describe('Post yield tests', () => {
		test('Owner should post price', async (done) => {
			const { mainFarm, user } = await returnUserFarms(1);
			const { crop } = await returnCrop(mainFarm);
			const price = getFakePrice(crop.crop_id, mainFarm.farm_id);

			postPriceRequest(price, { user_id: user.user_id, farm_id: mainFarm.farm_id }, async (err, res) => {
				expect(res.status).toBe(201);
				const prices = await priceModel.query().where('farm_id', mainFarm.farm_id);
				expect(prices.length).toBe(1);
				expect(prices[0].price_id).toBe(price.price_id);
				done();
			});
		});

		test('Manager should post price', async (done) => {
			const { mainFarm, user } = await returnUserFarms(2);
			const { crop } = await returnCrop(mainFarm);
			const price = getFakePrice(crop.crop_id, mainFarm.farm_id);

			postPriceRequest(price, { user_id: user.user_id, farm_id: mainFarm.farm_id }, async (err, res) => {
				expect(res.status).toBe(201);
				const prices = await priceModel.query().where('farm_id', mainFarm.farm_id);
				expect(prices.length).toBe(1);
				expect(prices[0].price_id).toBe(price.price_id);
				done();
			});
		});

		test('Should return 403 when worker tries to post price', async (done) => {
			const { mainFarm, user } = await returnUserFarms(3);
			const { crop } = await returnCrop(mainFarm);
			const price = getFakePrice(crop.crop_id, mainFarm.farm_id);

			postPriceRequest(price, { user_id: user.user_id, farm_id: mainFarm.farm_id }, async (err, res) => {
				expect(res.status).toBe(403);
				expect(res.error.text).toBe('User does not have the following permission(s): add:prices');
				done();
			});
		});

		test('Should return 403 when unauthorized user tries to post price', async (done) => {
			const { mainFarm, user } = await returnUserFarms(1);
			const { price } = await returnPrice(mainFarm);
			const [ unAuthorizedUser ] = await mocks.usersFactory();

			postPriceRequest(
				price,
				{ user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id },
				async (err, res) => {
					expect(res.status).toBe(403);
					expect(res.error.text).toBe('User does not have the following permission(s): add:prices');
					done();
				}
			);
		});
	});
});
