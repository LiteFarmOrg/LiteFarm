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

const userFarmModel = require('../src/models/userFarmModel');

describe('userFarm Tests', () => {
	let middleware;
	let farm;
	let newOwner;

	beforeAll(() => {
		token = global.token;
	});

	afterAll((done) => {
		server.close(() =>{
			done();
		});
	})

	// FUNCTIONS

	function postUserFarmDataRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
		chai
			.request(server)
			.post('/farmdata')
			.set('Content-Type', 'application/json')
			.set('user_id', user_id)
			.set('farm_id', farm_id)
			.send(data)
			.end(callback);
	}

	function fakeUserFarm(role = 1) {
		return { ...mocks.fakeUserFarm(), role_id: role };
	}

	function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
		chai
			.request(server)
			.get(`/farmdata/${farm_id}`)
			.set('user_id', user_id)
			.set('farm_id', farm_id)
			.end(callback);
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

  async function returnUserFarmData(user, farm) {
    const [ user_farm_data ] = await mocks.farmDataScheduleFactory({promisedUser: [user], promisedFarm: [ farm ] });
    return {user_farm_data};
}

  function getFakeUserFarmData(farm_id, user_id) {
    const userFarmData = mocks.fakeFarmDataSchedule();
    return ({ ...userFarmData, farm_id, user_id });
  }

	beforeEach(async () => {
		[ farm ] = await mocks.farmFactory();
		[ newOwner ] = await mocks.usersFactory();

		middleware = require('../src/middleware/acl/checkJwt');
		middleware.mockImplementation((req, res, next) => {
			req.user = {};
			req.user.sub = '|' + req.get('user_id');
			next();
		});
	});

	afterAll(async (done) => {
		await tableCleanup(knex);
		await knex.destroy();
		done();
	});

  // POST TESTS

  describe('Post userFarm tests', () => {

    test('Owner should post farm data at their farm', async (done) => {
      const {mainFarm, user} = await returnUserFarms(1);
      const fakeUserFarmData = await getFakeUserFarmData(mainFarm.farm_id, user.user_id);

      postUserFarmDataRequest(fakeUserFarmData, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
        expect(res.status).toBe(200);
        const userFarmDatas = await userFarmModel.query().where('farm_id', mainFarm.farm_id).andWhere('user_id', user.user_id);
        expect(userFarmDatas.length).toBe(1);
        expect(userFarmDatas[0].farm_id).toBe(fakeUserFarmData.farm_id);
        expect(userFarmDatas[0].user_id).toBe(fakeUserFarmData.user_id);
        done();
      })
    })

    test('Manager should post farm data at their farm', async (done) => {
        const {mainFarm, user} = await returnUserFarms(2);
        const fakeUserFarmData = await getFakeUserFarmData(mainFarm.farm_id, user.user_id);
  
        postUserFarmDataRequest(fakeUserFarmData, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
          expect(res.status).toBe(200);
          const userFarmDatas = await userFarmModel.query().where('farm_id', mainFarm.farm_id).andWhere('user_id', user.user_id);
          expect(userFarmDatas.length).toBe(1);
          expect(userFarmDatas[0].farm_id).toBe(fakeUserFarmData.farm_id);
          expect(userFarmDatas[0].user_id).toBe(fakeUserFarmData.user_id);
          done();
        })
      })

    test('Should return 403 when worker tries to post farm data at their farm', async (done) => {

      const {mainFarm, user} = await returnUserFarms(3);
      const fakeUserFarmData = await getFakeUserFarmData(mainFarm.farm_id, user.user_id);

      postUserFarmDataRequest(fakeUserFarmData, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): add:farm_schedules");
        done();
      })
    })

    test('Should return 403 when unauthorized user tries to post farm data', async (done) => {
      const { mainFarm, user } = await returnUserFarms(1);
      const fakeUserFarmData = await getFakeUserFarmData(mainFarm.farm_id, user.user_id);
	  const [unAuthorizedUser] = await mocks.usersFactory();

      postUserFarmDataRequest(fakeUserFarmData, {user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): add:farm_schedules");
        done();
      })
    })

  })

  // GET TESTS

	describe('Get userFarm tests', () => {

		test('Owner should get user farm data by farm id', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const {user_farm_data} = await returnUserFarmData(user, mainFarm);

            getRequest( { user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(200);
                expect(res.body[0].farm_id).toBe(user_farm_data.farm_id);
                done();
            });
	    });

        test('Manager should get user farm data by farm id', async (done) => {
            const {mainFarm, user} = await returnUserFarms(2);
            const {user_farm_data} = await returnUserFarmData(user, mainFarm);

            getRequest( { user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(200);
                expect(res.body[0].farm_id).toBe(user_farm_data.farm_id);
                done();
            });
	    });

        test('Worker should get 403 if they try to get user farm data by farm id', async (done) => {
            const {mainFarm, user} = await returnUserFarms(3);
            const {user_farm_data} = await returnUserFarmData(user, mainFarm);

            getRequest( { user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(403);
                expect(res.error.text).toBe("User does not have the following permission(s): get:farm_schedules");
                done();
            });
	    });

		test('Should get status 403 if an unauthorizedUser tries to get user farm by farm id', async (done) => {
			const { mainFarm, user } = await returnUserFarms(1);
			const [unAuthorizedUser] = await mocks.usersFactory();
			getRequest({ user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(403);
                expect(res.error.text).toBe("User does not have the following permission(s): get:farm_schedules");
				done();
			});
		});
	});
});
