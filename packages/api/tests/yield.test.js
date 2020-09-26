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
const environment = process.env.TEAMCITY_DOCKER_NETWORK ? 'pipeline': 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
jest.mock('../src/jobs/station_sync/mapping');
const mocks = require('./mock.factories');

const yieldModel = require('../src/models/yieldModel');

describe('Yield Tests', () => {
	let middleware;
	let farm;
	let newOwner;

	beforeAll(() => {
		token = global.token;
	});

	// FUNCTIONS

	function postYieldRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
		chai
			.request(server)
			.post('/yield')
			.set('Content-Type', 'application/json')
			.set('user_id', user_id)
			.set('farm_id', farm_id)
			.send(data)
			.end(callback);
	}

	function fakeUserFarm(role = 1) {
		return { ...mocks.fakeUserFarm(), role_id: role };
	}

	function putYieldRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    const { yield_id } = data;
		chai
			.request(server)
			.put(`/yield/${yield_id}`)
			.set('farm_id', farm_id)
			.set('user_id', user_id)
			.send(data)
			.end(callback);
	}

	function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
		chai
			.request(server)
			.get(`/yield/farm/${farm_id}`)
			.set('user_id', user_id)
			.set('farm_id', farm_id)
			.end(callback);
	}

	function deleteRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
		const { yield_id } = data;
		chai.request(server).delete(`/yield/${yield_id}`).set('user_id', user_id).set('farm_id', farm_id).end(callback);
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

  function getFakeYield(crop_id, farm_id) {
    const cropYield = mocks.fakeYield();
    return ({ ...cropYield, crop_id, farm_id });
  }

	async function returnYield(mainFarm) {
		const [ crop ] = await mocks.cropFactory({ promisedFarm: [ mainFarm ] });
    const [ crop_yield ] = await mocks.yieldFactory({ promisedCrop: [ crop ] });
    return {crop_yield};
  }

  async function returnCrop(mainFarm) {
    const [crop] = await mocks.cropFactory({ promisedFarm: [ mainFarm ] });
    return {crop};
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

    test('Owner should post yield', async (done) => {

      const {mainFarm, user} = await returnUserFarms(1);
      const {crop} = await returnCrop(mainFarm);
      const cropYield = getFakeYield(crop.crop_id, mainFarm.farm_id)

      postYieldRequest(cropYield, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
        expect(res.status).toBe(201);
        const yields = await yieldModel.query().where('farm_id', mainFarm.farm_id);
        expect(yields.length).toBe(1);
        expect(yields[0].yield_id).toBe(cropYield.yield_id);
        done();
      })
    })

    test('Manager should post yield', async (done) => {

      const {mainFarm, user} = await returnUserFarms(2);
      const {crop} = await returnCrop(mainFarm);
      const cropYield = getFakeYield(crop.crop_id, mainFarm.farm_id)

      postYieldRequest(cropYield, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
        expect(res.status).toBe(201);
        const yields = await yieldModel.query().where('farm_id', mainFarm.farm_id);
        expect(yields.length).toBe(1);
        expect(yields[0].yield_id).toBe(cropYield.yield_id);
        done();
      })
    })

    test('Should return 403 when worker tries to post yield', async (done) => {

      const {mainFarm, user} = await returnUserFarms(3);
      const {crop} = await returnCrop(mainFarm);
      const cropYield = getFakeYield(crop.crop_id, mainFarm.farm_id)

      postYieldRequest(cropYield, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): add:yields");
        done();
      })
    })

    test('Should return 403 when unauthorized user tries to post yield', async (done) => {
      const { mainFarm, user } = await returnUserFarms(1);
      const {cropYield} = await returnYield(mainFarm);
			const [unAuthorizedUser] = await mocks.usersFactory();

      postYieldRequest(cropYield, {user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("user not authorized to access farm");
        done();
      })
    })

  })

	// PUT TESTS
  describe('Put yield tests', () => {

    test('Owner should update quantity_kg/m2', async (done) => {

      const {mainFarm, user} = await returnUserFarms(1);
      const {crop_yield} = await returnYield(mainFarm)

      crop_yield["quantity_kg/m2"] = 8;
      putYieldRequest(crop_yield, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0]["quantity_kg/m2"]).toBe(8);
        done();
      })
    })

    test('Manager should update quantity_kg/m2', async (done) => {
      const {mainFarm, user} = await returnUserFarms(2);
      const {crop_yield} = await returnYield(mainFarm)

      crop_yield["quantity_kg/m2"] = 22;
      putYieldRequest(crop_yield, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0]["quantity_kg/m2"]).toBe(22);
        done();
      })
    })

    test('Should return 403 when a worker tries to edit quantity_kg/m2', async (done) => {
      const {mainFarm, user} = await returnUserFarms(3);
      const {crop_yield} = await returnYield(mainFarm)

      crop_yield["quantity_kg/m2"] = 4;
      putYieldRequest(crop_yield, { user_id: user.user_id, farm_id: mainFarm.farm_id }, async (err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): edit:yields");
        done();
      })
    })

    test('Should return 403 when a unauthorized user tries to edit quantity_kg/m2', async (done) => {
      const { mainFarm, user } = await returnUserFarms(1);
      const {crop_yield} = await returnYield(mainFarm);
			const [unAuthorizedUser] = await mocks.usersFactory();

      crop_yield["quantity_kg/m2"] = 4;
      putYieldRequest(crop_yield, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("user not authorized to access farm");
        done();
      })
    })

  })

  // GET TESTS

	describe('Get yield tests', () => {
		test('Owner should get yield by farm id', async (done) => {
      const {mainFarm, user} = await returnUserFarms(1);
      const {crop_yield} = await returnYield(mainFarm);

			getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
				expect(res.status).toBe(200);
				expect(res.body[0].farm_id).toBe(crop_yield.farm_id);
				done();
			});
		});

		test('Manager should get yield by farm id', async (done) => {
			const {mainFarm, user} = await returnUserFarms(2);
      const {crop_yield} = await returnYield(mainFarm);

			getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
				expect(res.status).toBe(200);
				expect(res.body[0].farm_id).toBe(crop_yield.farm_id);
				done();
			});
		});

		test('Worker should get yield by farm id', async (done) => {
			const {mainFarm, user} = await returnUserFarms(3);
      const {crop_yield} = await returnYield(mainFarm);

			getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
				expect(res.status).toBe(200);
				expect(res.body[0].farm_id).toBe(crop_yield.farm_id);
				done();
			});
		});

		test('Should get status 403 if an unauthorizedUser tries to get yield by farm id', async (done) => {
			const { mainFarm, user } = await returnUserFarms(1);
			const [unAuthorizedUser] = await mocks.usersFactory();
			getRequest({ user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): get:yields");
				done();
			});
		});
	});

  // DELETE TESTS

	describe('Delete yield tests', () => {
		test('Owner should delete their yield', async (done) => {
      const {mainFarm, user} = await returnUserFarms(1);
      const {crop_yield} = await returnYield(mainFarm);

			deleteRequest(crop_yield, { user_id: user.user_id, farm_id: mainFarm.farm_id }, async (err, res) => {
				expect(res.status).toBe(200);
				const [ deletedField ] = await yieldModel.query().where('yield_id', crop_yield.yield_id);
				expect(deletedField.deleted).toBe(true);
				done();
			});
		});

		test('Manager should delete their yield', async (done) => {
			const {mainFarm, user} = await returnUserFarms(2);
      const {crop_yield} = await returnYield(mainFarm);

			deleteRequest(
				crop_yield,
				{ user_id: user.user_id, farm_id: mainFarm.farm_id },
				async (err, res) => {
					expect(res.status).toBe(200);
					const [ deletedField ] = await yieldModel.query().where('yield_id', crop_yield.yield_id);
					expect(deletedField.deleted).toBe(true);
					done();
				}
			);
		});

		test('Should return 403 if a worker tries to delete a yield', async (done) => {
      const { mainFarm, user } = await returnUserFarms(3);
      const {crop_yield} = await returnYield(mainFarm);

			deleteRequest(crop_yield, { user_id: user.user_id, farm_id: mainFarm.farm_id }, async (err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): delete:yields");
				done();
			});
		});

		test('Should get status 403 if an unauthorizedUser tries to delete yield', async (done) => {
      const { mainFarm, user } = await returnUserFarms(1);
      const {crop_yield} = await returnYield(mainFarm);
			const [unAuthorizedUser] = await mocks.usersFactory();

			deleteRequest(
				crop_yield,
				{
					user_id: unAuthorizedUser.user_id,
					farm_id: mainFarm.farm_id
				},
				async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): delete:yields");
					done();
				}
			);
		});
	});
});
