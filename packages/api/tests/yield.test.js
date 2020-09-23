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

const yieldModel = require('../src/models/yieldModel');

describe('Yield Tests', () => {
	// GLOBAL CONSTANTS
	let middleware;
	let farm;
	let newOwner;
	let crop;

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

	function getFakeYield(crop_id = crop.crop_id) {
		const yield1 = mocks.fakeYield();
		return { ...yield1, crop_id };
	}

	function fakeUserFarm(role = 1) {
		return { ...mocks.fakeUserFarm(), role_id: role };
	}

	function putYieldRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    const { yield_id } = data;
    console.log("farm id is " + farm_id)
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
		let [ mainFarm ] = await mocks.farmFactory();
		let [ user ] = await mocks.usersFactory();
		let [ userFarm ] = await mocks.userFarmFactory(
			{
				promisedUser: [ user ],
				promisedFarm: [ mainFarm ]
			},
			fakeUserFarm(role)
		);
		return { mainFarm, user };
	}

	async function returnYield(mainFarm) {
		let [ crop ] = await mocks.cropFactory({ promisedFarm: [ mainFarm ] });
    let [ crop_yield ] = await mocks.yieldFactory({ promisedCrop: [ crop ] });
    return {crop_yield};
  }

	// GLOBAL BEFOREEACH
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
		let ownerFarm;

		let newManager;
		let managerFarm;

		let newWorker;
		let workerFarm;

		let unAuthorizedUser;
		let farmunAuthorizedUser;
		let ownerFarmunAuthorizedUser;

		beforeEach(async () => {
			[ ownerFarm ] = await mocks.userFarmFactory(
				{ promisedUser: [ newOwner ], promisedFarm: [ farm ] },
				fakeUserFarm(1)
			);

			[ newManager ] = await mocks.usersFactory();
			[ managerFarm ] = await mocks.userFarmFactory(
				{
					promisedUser: [ newManager ],
					promisedFarm: [ farm ]
				},
				fakeUserFarm(2)
			);

			[ newWorker ] = await mocks.usersFactory();
			[ workerFarm ] = await mocks.userFarmFactory(
				{ promisedUser: [ newWorker ], promisedFarm: [ farm ] },
				fakeUserFarm(3)
			);

			[ unAuthorizedUser ] = await mocks.usersFactory();
			[ farmunAuthorizedUser ] = await mocks.farmFactory();
			[ ownerFarmunAuthorizedUser ] = await mocks.userFarmFactory(
				{
					promisedUser: [ unAuthorizedUser ],
					promisedFarm: [ farmunAuthorizedUser ]
				},
				fakeUserFarm(1)
			);
		});

		test('Owner should post and get valid yield', async (done) => {
			let fakeYield1 = getFakeYield();
			fakeYield1.farm_id = ownerFarm.farm_id;
			postYieldRequest(
				fakeYield1,
				{ user_id: newOwner.user_id, farm_id: ownerFarm.farm_id },
				async (err, res) => {
					expect(res.status).toBe(201);
					const yields = await yieldModel.query().where('farm_id', farm.farm_id);
					expect(yields.length).toBe(1);
					expect(yields[0].yield_id).toBe(fakeYield1.yield_id);
					done();
				}
			);
		});

		test('Manager should post and get a valid yield', async (done) => {
			let fakeYield2 = getFakeYield();
			fakeYield2.farm_id = managerFarm.farm_id;
			postYieldRequest(
				fakeYield2,
				{ user_id: newManager.user_id, farm_id: managerFarm.farm_id },
				async (err, res) => {
					expect(res.status).toBe(201);
					const yields = await yieldModel.query().where('farm_id', farm.farm_id);
					expect(yields.length).toBe(1);
					expect(yields[0].yield_id).toBe(fakeYield2.yield_id);
					done();
				}
			);
		});

		test('Should return 403 when worker tries to post yield', async (done) => {
			let fakeYield3 = getFakeYield();
			fakeYield3.farm_id = workerFarm.farm_id;
			postYieldRequest(
				fakeYield3,
				{ user_id: newWorker.user_id, farm_id: workerFarm.farm_id },
				async (err, res) => {
					expect(res.status).toBe(403);
					expect(res.error.text).toBe('User does not have the following permission(s): add:yields');
					done();
				}
			);
		});

		test('Should return 403 when unauthorized user tries to post yield', async (done) => {
			let fakeYield4 = getFakeYield();
			fakeYield4.farm_id = ownerFarmunAuthorizedUser.farm_id;
			postYieldRequest(fakeYield4, { user_id: unAuthorizedUser.user_id }, (err, res) => {
				expect(res.status).toBe(403);
				done();
			});
		});
	});

	// PUT TESTS
  describe('Put yield tests', () => {

    test('Owner should update quantity_kg/m2', async (done) => {
      let [ownerFarm] = await mocks.userFarmFactory({
        promisedUser: [newOwner],
        promisedFarm: [farm]
      }, fakeUserFarm(1));
      let [ownerCrop] = await mocks.cropFactory({ promisedFarm: [farm] });
      let [ownerYield] = await mocks.yieldFactory({ promisedCrop: [ownerCrop] });

      ownerYield["quantity_kg/m2"] = 8;
      putYieldRequest(ownerYield, {}, async (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0]["quantity_kg/m2"]).toBe(8);
        done();
      })
    })

    test('Manager should update quantity_kg/m2', async (done) => {
      let [newManager] = await mocks.usersFactory();
      let [managerFarm] = await mocks.userFarmFactory({
        promisedUser: [newManager],
        promisedFarm: [farm]
      }, fakeUserFarm(2));
      let [managerCrop] = await mocks.cropFactory({ promisedFarm: [farm] });
      let [managerYield] = await mocks.yieldFactory({ promisedCrop: [managerCrop] });

      managerYield["quantity_kg/m2"] = 22;
      putYieldRequest(managerYield, { user_id: newManager.user_id }, async (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0]["quantity_kg/m2"]).toBe(22);
        done();
      })
    })

    test('Should return 403 when a worker tries to edit quantity_kg/m2', async (done) => {
      let [newWorker] = await mocks.usersFactory();
      let [workerFarm] = await mocks.userFarmFactory({
        promisedUser: [newWorker],
        promisedFarm: [farm]
      }, fakeUserFarm(3));
      let [workerCrop] = await mocks.cropFactory({ promisedFarm: [farm] });
      let [workerYield] = await mocks.yieldFactory({ promisedCrop: [workerCrop] });

      workerYield["quantity_kg/m2"] = 4;
      putYieldRequest(workerYield, { user_id: newWorker.user_id }, async (err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): edit:yields");
        done();
      })
    })

    test('Should return 403 when a unauthorized user tries to edit quantity_kg/m2', async (done) => {
      let [unAuthorizedUser] = await mocks.usersFactory();
      let [farmUnAuthorizedUser] = await mocks.farmFactory();
      let [ownerFarmUnAuthorizedUser] = await mocks.userFarmFactory({
        promisedUser: [unAuthorizedUser],
        promisedFarm: [farmUnAuthorizedUser]
      }, fakeUserFarm(1));
      let [unauthorizedCrop] = await mocks.cropFactory({ promisedFarm: [farmUnAuthorizedUser] });
      let [unauthorizedYield] = await mocks.yieldFactory({ promisedCrop: [unauthorizedCrop] });

      unauthorizedYield["quantity_kg/m2"] = 4;
      putYieldRequest(unauthorizedYield, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
        expect(res.status).toBe(403);
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
					done();
				}
			);
		});
	});
});
