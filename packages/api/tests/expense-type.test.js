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

const farmExpenseTypeModel = require('../src/models/expenseTypeModel');

describe('Expense Type Tests', () => {
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

	function postExpenseTypeRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
		chai
			.request(server)
			.post(`/expense_type`)
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

    async function returnExpenseType(mainFarm) {
        const [expense_type] = await mocks.expenseTypeFactory({ promisedFarm: [ mainFarm ] });
        return {expense_type};
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

	afterEach(async () => {
		await tableCleanup(knex);
	});

    // POST TESTS

    describe('Post expense tests', () => {
        
        test('Owner should post expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const {expense_type} = await returnExpenseType(mainFarm);

            postExpenseTypeRequest(expense_type, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
                console.log(res.error)
                expect(res.status).toBe(201);
                // const expenses = await farmExpenseModel.query().where('farm_id', mainFarm.farm_id);
                // expect(expenses.length).toBe(1);
                // expect(expenses[0].value).toBe(expense.value);
                done();
            })
        })

    });

  
});
