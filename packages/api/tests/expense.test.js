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

const farmExpenseModel = require('../src/models/farmExpenseModel');

describe('Expense Tests', () => {
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

	function postExpenseRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
		chai
			.request(server)
			.post(`/expense/farm/${farm_id}`)
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
			.get(`/expense/farm/${farm_id}`)
			.set('user_id', user_id)
			.set('farm_id', farm_id)
			.end(callback);
	}

	function deleteRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
        const { expense_id } = data;
		chai.request(server).delete(`/expense/${expense_id}`).set('user_id', user_id).set('farm_id', farm_id).end(callback);
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

    function getFakeExpense(expense_type_id, farm_id) {
        const expense = mocks.fakeExpense();
        return { ...expense, expense_type_id, farm_id };
    }

    async function returnExpenseType(mainFarm) {
        const [expense_type] = await mocks.expenseTypeFactory({ promisedFarm: [ mainFarm ] });
        return {expense_type};
    }

    async function returnExpense(mainFarm) {
		const [ expense_type ] = await mocks.expenseTypeFactory({ promisedFarm: [ mainFarm ] });
        const [ expense ] = await mocks.expenseFactory({ promisedExpenseType: [ expense_type ] });
        return {expense};
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
        
        test('Owner should post expense', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const {expense_type} = await returnExpenseType(mainFarm);
            const expense = getFakeExpense(expense_type.expense_type_id, mainFarm.farm_id)
            const expensesArray = []
            expensesArray.push(expense)

            postExpenseRequest(expensesArray, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(201);
                const expenses = await farmExpenseModel.query().where('farm_id', mainFarm.farm_id);
                expect(expenses.length).toBe(1);
                expect(expenses[0].farm_expense_id).toBe(expense.farm_expense_id);
                done();
            })
        })

        test('Manager should post expense', async (done) => {

            const {mainFarm, user} = await returnUserFarms(2);
            const {expense_type} = await returnExpenseType(mainFarm);
            const expense = getFakeExpense(expense_type.expense_type_id, mainFarm.farm_id);
            const expensesArray = []
            expensesArray.push(expense)
    
            postExpenseRequest(expensesArray, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
            expect(res.status).toBe(201);
            const expenses = await farmExpenseModel.query().where('farm_id', mainFarm.farm_id);
            expect(expenses.length).toBe(1);
            expect(expenses[0].farm_expense_id).toBe(expense.farm_expense_id);
            done();
            })
        })

        test('Worker should post expense', async (done) => {

            const {mainFarm, user} = await returnUserFarms(3);
            const {expense_type} = await returnExpenseType(mainFarm);
            const expense = getFakeExpense(expense_type.expense_type_id, mainFarm.farm_id);
            const expensesArray = []
            expensesArray.push(expense)
    
            postExpenseRequest(expensesArray, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
            expect(res.status).toBe(201);
            const expenses = await farmExpenseModel.query().where('farm_id', mainFarm.farm_id);
            expect(expenses.length).toBe(1);
            expect(expenses[0].farm_expense_id).toBe(expense.farm_expense_id);
            done();
            })
        })

        test('Should return 403 when unauthorized user tries to post expense', async (done) => {
            const { mainFarm, user } = await returnUserFarms(1);
            const {expense_type} = await returnExpenseType(mainFarm);
            const [unAuthorizedUser] = await mocks.usersFactory();
            const expense = getFakeExpense(expense_type.expense_type_id, mainFarm.farm_id);
            const expensesArray = []
            expensesArray.push(expense)

            postExpenseRequest(expensesArray, {user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
            expect(res.status).toBe(403);
            expect(res.error.text).toBe("User does not have the following permission(s): add:expenses");
            done();
            })
        })

    });

    // GET TESTS

    describe('Get expense tests', () => {
        
        test('Owner should get expense by farm id', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const {expense} = await returnExpense(mainFarm);
      
            getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(200);
                expect(res.body[0].farm_id).toBe(expense.farm_id);
                done();
            });
        });
        test('Manager should get expense by farm id', async (done) => {
            const {mainFarm, user} = await returnUserFarms(2);
            const {expense} = await returnExpense(mainFarm);
      
            getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(200);
                expect(res.body[0].farm_id).toBe(expense.farm_id);
                done();
            });
        });
        test('ManWorkerager should get expense by farm id', async (done) => {
            const {mainFarm, user} = await returnUserFarms(3);
            const {expense} = await returnExpense(mainFarm);
      
            getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(200);
                expect(res.body[0].farm_id).toBe(expense.farm_id);
                done();
            });
        });
        test('Should get status 403 if an unauthorizedUser tries to get expense by farm id', async (done) => {
			const { mainFarm, user } = await returnUserFarms(1);
			const [unAuthorizedUser] = await mocks.usersFactory();
			getRequest({ user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
            expect(res.status).toBe(403);
            expect(res.error.text).toBe("User does not have the following permission(s): get:expenses");
			done();
			});
		});

    });

  
});
