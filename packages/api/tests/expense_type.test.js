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
    let farm1;
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

    function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
		chai
			.request(server)
			.get(`/expense_type/farm/${farm_id}`)
			.set('user_id', user_id)
			.set('farm_id', farm_id)
			.end(callback);
    }
    
    function getDefaultRequest({user_id = newOwner.user_id, farm_id = farm1.farm_id}, callback) {
		chai
			.request(server)
            .get(`/expense_type`)
            .set('user_id', user_id)
            .set('farm_id', farm_id)
            // .send(farm_id)
			.end(callback);
    }
    
    function deleteRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
        const {expense_type_id} = data;
		chai.request(server).delete(`/expense_type/${expense_type_id}`).set('user_id', user_id).set('farm_id', farm_id).end(callback);
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
        const [expense_type] = await mocks.farmExpenseTypeFactory({ promisedFarm: [ mainFarm ] });
        return {expense_type};
    }

    async function returnDefaultExpenseType() {
        const defaultFarm = mocks.farmFactory();
        defaultFarm.farm_id = null;
        const [expense_type] = await mocks.farmExpenseTypeFactory({ promisedFarm: [ defaultFarm ] });
        return {expense_type};
    }

    function getFakeExpenseType(farm_id) {
        const expense = mocks.fakeExpenseType();
        return { ...expense, farm_id };
    }

   beforeEach(async () => {
    [ farm ] = await mocks.farmFactory();
    [ farm1 ] = await mocks.farmFactory();
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

    describe('Post expense type tests', () => {
        
        test('Owner should post expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const expense_type = getFakeExpenseType(mainFarm.farm_id)

            postExpenseTypeRequest(expense_type, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(201);
                const expense_types = await farmExpenseTypeModel.query().where('farm_id', mainFarm.farm_id);
                expect(expense_types.length).toBe(1);
                expect(expense_types[0].value).toBe(expense_type.value);
                done();   
            })
        })
        test('Manager should post expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(2);
            const expense_type = getFakeExpenseType(mainFarm.farm_id)

            postExpenseTypeRequest(expense_type, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(201);
                const expense_types = await farmExpenseTypeModel.query().where('farm_id', mainFarm.farm_id);
                expect(expense_types.length).toBe(1);
                expect(expense_types[0].value).toBe(expense_type.value);
                done();   
            })
        })
        test('Worker should get 403 if they try to post expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(3);
            const expense_type = getFakeExpenseType(mainFarm.farm_id)

            postExpenseTypeRequest(expense_type, {user_id: user.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(403);
                expect(res.error.text).toBe("User does not have the following permission(s): add:expense_types");
                done();   
            })
        })
        test('Unauthorized user should get 403 if they try to post expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(3);
            const expense_type = getFakeExpenseType(mainFarm.farm_id)
            const [unAuthorizedUser] = await mocks.usersFactory();

            postExpenseTypeRequest(expense_type, {user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(403);
                expect(res.error.text).toBe("User does not have the following permission(s): add:expense_types");
                done();   
            })
        })
    })

    // GET TESTS

    describe('Get expense type tests', () => {
        
        test('Owner should get expense type by farm id (or null)', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const expense = await returnExpenseType(mainFarm);
      
            getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(200);
                
                expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
                done();
            });
        });
        test('manager should get expense type by farm id (or null)', async (done) => {
            const {mainFarm, user} = await returnUserFarms(2);
            const expense = await returnExpenseType(mainFarm);
      
            getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(200);
                
                expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
                done();
            });
        });
        test('Worker should get expense type by farm id (or null)', async (done) => {
            const {mainFarm, user} = await returnUserFarms(3);
            const expense = await returnExpenseType(mainFarm);
      
            getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(200);
                
                expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
                done();
            });
        });
        test('Unauthorized user should get 403 if they try to get expense type by farm id (or null)', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const expense = await returnExpenseType(mainFarm);
            const [unAuthorizedUser] = await mocks.usersFactory();

            getRequest({ user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id }, (err, res) => {
                expect(res.status).toBe(403);
                expect(res.error.text).toBe("User does not have the following permission(s): get:expense_types");
                done();
            });
        })
    })

      // GET DEFAULT TESTS

      describe('Get expense type default tests', () => {
        
        test.only('Owner should get default expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const expense = await returnDefaultExpenseType();

            getDefaultRequest({ user_id: user.user_id, farm_id: expense.expense_type.farm_id}, (err, res) => {
                // expect(res.status).toBe(200);
                console.log("error is")
                console.log(res.error)
                
                // expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
                done();
            });
        });
        test('manager should get default expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(2);
            const expense = await returnDefaultExpenseType();
      
            getDefaultRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id}, (err, res) => {
                expect(res.status).toBe(200);
                
                expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
                done();
            });
        });
        test('worker should get default expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(3);
            const expense = await returnDefaultExpenseType();
      
            getDefaultRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id}, (err, res) => {
                expect(res.status).toBe(200);
                
                expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
                done();
            });
        });
        test('Unauthorized user should get default expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const expense = await returnDefaultExpenseType();
            const [unAuthorizedUser] = await mocks.usersFactory();
      
            getDefaultRequest({ user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id}, (err, res) => {
                expect(res.status).toBe(200);
                console.log(res.error)
                
                expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
                done();
            });
        });
    })

    // DELETE DEFAULT TEST

    describe('Delete expense type default tests', () => {
        
        test('Owner should get 403 if they try to delete default expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const expense = await returnDefaultExpenseType();
      
            deleteRequest(expense.expense_type, { user_id: expense.user_id}, (err, res) => {
                expect(res.status).toBe(403);
                done();
            });
        });
        test('manager should get 403 if they try to delete default expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(2);
            const expense = await returnDefaultExpenseType();
      
            deleteRequest(expense.expense_type, { user_id: user.user_id}, (err, res) => {
                expect(res.status).toBe(403);
                done();
            });
        });
        test('Worker should get 403 if they try to delete default expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(3);
            const expense = await returnDefaultExpenseType();
      
            deleteRequest(expense.expense_type, { user_id: user.user_id}, (err, res) => {
                expect(res.status).toBe(403);
                done();
            });
        });
        test('unauthorized user should get 403 if they try to delete default expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const expense = await returnDefaultExpenseType();
            const [unAuthorizedUser] = await mocks.usersFactory();
      
            deleteRequest(expense.expense_type, { user_id: unAuthorizedUser.user_id}, (err, res) => {
                expect(res.status).toBe(403);
                done();
            });
        });
    })

     // DELETE TESTS

     describe('Delete expense type tests', () => {
        
        test('Owner should delete their expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const expense = await returnExpenseType(mainFarm);
      
            deleteRequest(expense.expense_type, { user_id: user.user_id, farm_id: mainFarm.farm_id }, async (err, res) => {
                expect(res.status).toBe(200);
                const [ deletedField ] = await farmExpenseTypeModel.query().where('expense_type_id', expense.expense_type.expense_type_id);
                expect(deletedField.deleted).toBe(true);
                done();
            });
        });
        test('manager should delete their expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(2);
            const expense = await returnExpenseType(mainFarm);
      
            deleteRequest(expense.expense_type, { user_id: user.user_id, farm_id: mainFarm.farm_id }, async (err, res) => {
                expect(res.status).toBe(200);
                const [ deletedField ] = await farmExpenseTypeModel.query().where('expense_type_id', expense.expense_type.expense_type_id);
                expect(deletedField.deleted).toBe(true);
                done();
            });
        });
        test('worker should get 403 if they try to delete their expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(3);
            const expense = await returnExpenseType(mainFarm);
      
            deleteRequest(expense.expense_type, { user_id: user.user_id, farm_id: mainFarm.farm_id }, async (err, res) => {
                expect(res.status).toBe(403);
                expect(res.error.text).toBe("User does not have the following permission(s): delete:expense_types");
                done();
            });
        });
        test('Unauthorized user should delete get 403 if they try to delete their expense type', async (done) => {
            const {mainFarm, user} = await returnUserFarms(1);
            const [unAuthorizedUser] = await mocks.usersFactory();
            const expense = await returnExpenseType(mainFarm);
      
            deleteRequest(expense.expense_type, { user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id }, async (err, res) => {
                expect(res.status).toBe(403);
                expect(res.error.text).toBe("User does not have the following permission(s): delete:expense_types");
                done();
            });
        });

    });




})