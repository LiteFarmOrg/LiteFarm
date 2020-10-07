const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('./../src/server');
const Knex = require('knex')
const environment = process.env.TEAMCITY_DOCKER_NETWORK ? 'pipeline' : 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
const { tableCleanup } = require('./testEnvironment')
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks = require('./mock.factories');

describe('Shift tests', () => {
  let middleware;
  beforeAll(() => {
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
  });

  afterEach(async () => {
    await tableCleanup(knex);
  })

  function getShiftsAtFarm({ user_id, farm_id }, callback) {
    chai.request(server)
      .get(`/shift/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function getMyShifts({ user_id, farm_id }, callback) {
    chai.request(server)
      .get(`/shift/user/${user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function getShiftById({ user_id, farm_id }, shift_id, callback) {
    chai.request(server)
      .get(`/shift/${shift_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function postShift({ user_id, farm_id }, shiftData, callback) {
    chai.request(server)
      .post(`/shift`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(shiftData)
      .end(callback);
  }

  function putShift({ user_id, farm_id }, shiftData, callback) {
    chai.request(server)
      .put(`/shift/${shiftData.shift_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(shiftData)
      .end(callback);
  }

  function deleteShift({user_id, farm_id}, shiftId, callback) {
    chai.request(server)
      .delete(`/shift/${shiftId}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }


  async function appendUserFarmAShiftTask({ user_id, farm_id }, shiftData= mocks.fakeShift()) {
    let fieldForFarm = await mocks.fieldFactory({ promisedFarm: [{ farm_id }] });
    let fieldCropForField = await mocks.fieldCropFactory({ promisedField: fieldForFarm });
    let shift = await mocks.shiftFactory({ promisedUserFarm: [{ user_id, farm_id }] }, shiftData);
    return await mocks.shiftTaskFactory({
      promisedShift: shift,
      promisedField: fieldForFarm,
      promisedFieldCrop: fieldCropForField
    })
  }

  /*
  * Creates a userFarm A, assigns a shift to that user Farm
  * Creates another user B at that same farm,
  * assigns a shift to that other user B
  * Creates another userFarm which the user B is part of
  * Assigns shifts to the new userFarm B is part of
  * A is part of the same user farm as B and they both have shifts on that user farm
  * B is part of another user farm and has 1 shift there as well.
  * returns A user and its farm
  * */
  async function setupAtMyFarm(role) {
    let [{ user_id, farm_id }] = await mocks.userFarmFactory({}, {status: 'Active', role_id: role});
    let anotherUser = await mocks.usersFactory();
    let [anotherUserFarm] = await mocks.userFarmFactory({ promisedUser: anotherUser, promisedFarm: [{ farm_id }] });
    let [differentFarmForTheSameUser] = await mocks.userFarmFactory({ promisedUser: [{ user_id }] });
    let [completelyUnrelatedFarm]  = await mocks.userFarmFactory();
    await appendUserFarmAShiftTask({ user_id, farm_id });
    await appendUserFarmAShiftTask({user_id: anotherUserFarm.user_id, farm_id})
    await appendUserFarmAShiftTask({ user_id, farm_id: differentFarmForTheSameUser.farm_id })
    await appendUserFarmAShiftTask({user_id: completelyUnrelatedFarm.user_id, farm_id: completelyUnrelatedFarm.farm_id});
    return {user_id, farm_id}
  }

  async function createShiftData(userFarm, notOwnedFarm) {
    let shiftData = mocks.fakeShift();
    shiftData.break_duration = 10;
    let [shiftTask] = await appendUserFarmAShiftTask(notOwnedFarm ? notOwnedFarm : userFarm, shiftData);
    shiftData.tasks = [{...shiftTask}];
    if(notOwnedFarm) {
      shiftData.user_id = notOwnedFarm.user_id;
      shiftData.farm_id = notOwnedFarm.farm_id;
    } else {
      shiftData.user_id = userFarm.user_id;
      shiftData.farm_id = userFarm.farm_id;
    }
    shiftData.shift_id = shiftTask.shift_id;
    return shiftData
  }

  describe('GET farm/farm:id At my farm', () => {

    test('should get shifts at my farm for owner', async (done) => {
      const {user_id, farm_id} = await setupAtMyFarm(1);
      getShiftsAtFarm({ user_id, farm_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.every((shift) => shift.farm_id === farm_id)).toBe(true);
        done();
      })
    })

    test('should get shifts at my farm for manager', async (done) => {
      const {user_id, farm_id} = await setupAtMyFarm(2);
      getShiftsAtFarm({ user_id, farm_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.every((shift) => shift.farm_id === farm_id)).toBe(true);
        done();
      })
    })

    test('should get only my shift as worker at my farm', async (done) => {
      const {user_id, farm_id} = await setupAtMyFarm(3);
      getShiftsAtFarm({ user_id, farm_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body.every((shift) => shift.farm_id === farm_id)).toBe(true)
        done();
      })
    })
  })

  describe('GET /user/:user_id ', () => {
    test('should get only my shifts as an owner (on 2 farms)', async (done) => {
      const {user_id, farm_id} = await setupAtMyFarm(1);
      getMyShifts({user_id, farm_id}, (err,res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.every((shift) => shift.user_id === user_id)).toBe(true);
        expect(res.body.some((shift) => shift.farm_id !== farm_id)).toBe(true);
        done();
      })
    })

    test('should get only my shifts as a manager (on 2 farms)', async (done) => {
      const {user_id, farm_id} = await setupAtMyFarm(2);
      getMyShifts({user_id, farm_id}, (err,res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.every((shift) => shift.user_id === user_id)).toBe(true);
        expect(res.body.some((shift) => shift.farm_id !== farm_id)).toBe(true);
        done();
      })
    });

    test('should get only my shifts as a worker (on 2 farms)', async (done) => {
      const {user_id, farm_id} = await setupAtMyFarm(3);
      getMyShifts({user_id, farm_id}, (err,res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.every((shift) => shift.user_id === user_id)).toBe(true);
        expect(res.body.some((shift) => shift.farm_id !== farm_id)).toBe(true);
        done();
      })
    })
  })

  describe('GET /shift_id ', () => {
    test('should get the shift I asked for if I am the owner of it as farm owner', async (done) => {
      let [{ user_id, farm_id }] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      const [shiftTask] = await appendUserFarmAShiftTask({user_id, farm_id});
      getShiftById({user_id, farm_id}, shiftTask.shift_id, (err,res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].shift_id).toBe(shiftTask.shift_id);
        done();
      })
    })

    test('should get the shift I asked for if I am the owner of it as farm manager', async (done) => {
      let [{ user_id, farm_id }] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 2});
      const [shiftTask] = await appendUserFarmAShiftTask({user_id, farm_id});
      getShiftById({user_id, farm_id}, shiftTask.shift_id, (err,res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].shift_id).toBe(shiftTask.shift_id);
        done();
      })
    })

    test('should get the shift I asked for if I am the owner of it as farm worker', async (done) => {
      let [{ user_id, farm_id }] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 3});
      const [shiftTask] = await appendUserFarmAShiftTask({user_id, farm_id});
      getShiftById({user_id, farm_id}, shiftTask.shift_id, (err,res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].shift_id).toBe(shiftTask.shift_id);
        done();
      })
    })

    test('should not get the shift I asked for if I am not the owner of it', async (done) => {
      let [anotherUserFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      const [shiftTask] = await appendUserFarmAShiftTask(anotherUserFarm);
      let [{ user_id, farm_id }] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      getShiftById({user_id, farm_id}, shiftTask.shift_id, (err,res) => {
        expect(res.status).toBe(403);
        done();
      })
    })
  });

  describe('POST /shift', () => {
    test('should create a shift owned by me with 1 task being an owner', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let [field] = await mocks.fieldFactory({promisedFarm: [userFarm]})
      let shift = mocks.fakeShift()
      shift.tasks = [mocks.fakeShiftTask()]
      shift.tasks[0].field_id = field.field_id;
      shift.user_id = userFarm.user_id;
      shift.farm_id = userFarm.farm_id;
      postShift(userFarm, shift, (err,res) => {
        expect(res.status).toBe(201);
        expect(res.body.user_id).toBe(shift.user_id);
        expect(res.body.farm_id).toBe(shift.farm_id);
        done();
      })
    })
    test('should create a shift owned by me with many tasks being an owner', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let [field] = await mocks.fieldFactory({promisedFarm: [userFarm]})
      let shift = mocks.fakeShift()
      shift.tasks = [...Array(4)].map(() => mocks.fakeShiftTask());
      shift.tasks.map(task => task.field_id = field.field_id);
      shift.user_id = userFarm.user_id;
      shift.farm_id = userFarm.farm_id;
      postShift(userFarm, shift, (err,res) => {
        expect(res.status).toBe(201);
        expect(res.body.user_id).toBe(shift.user_id);
        expect(res.body.farm_id).toBe(shift.farm_id);
        done();
      })
    })

    test('should create a shift owned by me with 1 task being a Manager', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 2});
      let [field] = await mocks.fieldFactory({promisedFarm: [userFarm]})
      let shift = mocks.fakeShift()
      shift.tasks = [mocks.fakeShiftTask()]
      shift.tasks[0].field_id = field.field_id;
      shift.user_id = userFarm.user_id;
      shift.farm_id = userFarm.farm_id;
      postShift(userFarm, shift, (err,res) => {
        expect(res.status).toBe(201);
        expect(res.body.user_id).toBe(shift.user_id);
        expect(res.body.farm_id).toBe(shift.farm_id);
        done();
      })
    })
    test('should create a shift owned by me with many tasks being a Manager', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 2});
      let [field] = await mocks.fieldFactory({promisedFarm: [userFarm]})
      let shift = mocks.fakeShift()
      shift.tasks = [...Array(4)].map(() => mocks.fakeShiftTask());
      shift.tasks.map(task => task.field_id = field.field_id);
      shift.user_id = userFarm.user_id;
      shift.farm_id = userFarm.farm_id;
      postShift(userFarm, shift, (err,res) => {
        expect(res.status).toBe(201);
        expect(res.body.user_id).toBe(shift.user_id);
        expect(res.body.farm_id).toBe(shift.farm_id);
        done();
      })
    })

    test('should create a shift owned by me with 1 task being a worker', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 3});
      let [field] = await mocks.fieldFactory({promisedFarm: [userFarm]})
      let shift = mocks.fakeShift()
      shift.tasks = [mocks.fakeShiftTask()]
      shift.tasks[0].field_id = field.field_id;
      shift.user_id = userFarm.user_id;
      shift.farm_id = userFarm.farm_id;
      postShift(userFarm, shift, (err,res) => {
        expect(res.status).toBe(201);
        expect(res.body.user_id).toBe(shift.user_id);
        expect(res.body.farm_id).toBe(shift.farm_id);
        done();
      })
    })
    test('should create a shift owned by me with many tasks being a worker', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 3});
      let [field] = await mocks.fieldFactory({promisedFarm: [userFarm]})
      let shift = mocks.fakeShift()
      shift.tasks = [...Array(4)].map(() => mocks.fakeShiftTask());
      shift.tasks.map(task => task.field_id = field.field_id);
      shift.user_id = userFarm.user_id;
      shift.farm_id = userFarm.farm_id;
      postShift(userFarm, shift, (err,res) => {
        expect(res.status).toBe(201);
        expect(res.body.user_id).toBe(shift.user_id);
        expect(res.body.farm_id).toBe(shift.farm_id);
        done();
      })
    })

    test('should not be able to create a shift that is not mine' , async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let [otherUserFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let [field] = await mocks.fieldFactory({promisedFarm: [otherUserFarm]})
      let shift = mocks.fakeShift()
      shift.tasks = [mocks.fakeShiftTask()]
      shift.tasks[0].field_id = field.field_id;
      shift.user_id = otherUserFarm.user_id;
      shift.farm_id = otherUserFarm.farm_id;
      postShift(userFarm, shift, (err,res) => {
        expect(res.status).toBe(403);
        done();
      })
    })

  })

  describe('PUT /shift/:id', () => {
    test('should update a shift that is owned by me. As owner', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let shiftData = await createShiftData(userFarm);
      putShift(userFarm, shiftData, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].tasks).toStrictEqual(shiftData.tasks);
        expect(res.body[0].break_duration).toBe(10);
        done();
      })
    })

    test('should  update a shift that is NOT owned by me (in my farm). As owner', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let [anotherUserFarm] = await mocks.userFarmFactory({ promisedFarm: [userFarm]}, {status: 'Active', role_id: 1});
      let shiftData = await createShiftData(userFarm, anotherUserFarm);
      putShift(userFarm, shiftData, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].tasks).toStrictEqual(shiftData.tasks);
        expect(res.body[0].break_duration).toBe(10);
        done();
      })
    })


    test('should NOT update a shift that is NOT in my farm. As owner', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let [anotherUserFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let shiftData = await createShiftData(userFarm, anotherUserFarm)
      putShift(userFarm, shiftData, (err, res) => {
        expect(res.status).toBe(403);
        done();
      })
    })

    test('should update a shift that is owned by me. As manager', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 2});
      let shiftData = await createShiftData(userFarm);
      putShift(userFarm, shiftData, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].tasks).toStrictEqual(shiftData.tasks);
        expect(res.body[0].break_duration).toBe(10);
        done();
      })
    })

    test('should  update a shift that is NOT owned by me (in my farm). As manager', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 2});
      let [anotherUserFarm] = await mocks.userFarmFactory({ promisedFarm: [userFarm]}, {status: 'Active', role_id: 1});
      let shiftData = await createShiftData(userFarm, anotherUserFarm);
      putShift(userFarm, shiftData, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].tasks).toStrictEqual(shiftData.tasks);
        expect(res.body[0].break_duration).toBe(10);
        done();
      })
    })


    test('should NOT update a shift that is NOT in my farm. As manager', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 2});
      let [anotherUserFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let shiftData = await createShiftData(userFarm, anotherUserFarm);
      putShift(userFarm, shiftData, (err, res) => {
        expect(res.status).toBe(403);
        done();
      })
    })

    test('should update a shift that is owned by me. As worker', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 3});
      let shiftData = await createShiftData(userFarm);
      putShift(userFarm, shiftData, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].tasks).toStrictEqual(shiftData.tasks);
        expect(res.body[0].break_duration).toBe(10);
        done();
      })
    })

    test('should not  update a shift that is NOT owned by me (in my farm). As worker', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 3});
      let [anotherUserFarm] = await mocks.userFarmFactory({ promisedFarm: [userFarm]}, {status: 'Active', role_id: 1});
      let shiftData = await createShiftData(userFarm, anotherUserFarm);
      putShift(userFarm, shiftData, (err, res) => {
        expect(res.status).toBe(403);
        done();
      })
    })


    test('should NOT update a shift that is NOT in my farm. As worker', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 3});
      let [anotherUserFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let shiftData = await createShiftData(userFarm, anotherUserFarm);
      putShift(userFarm, shiftData, (err, res) => {
        expect(res.status).toBe(403);
        done();
      })
    })
  })



  describe('DELETE /shift/:id' , () => {
    test('should delete a shift I own at my farm. As owner', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let shiftData = await createShiftData(userFarm);
      deleteShift(userFarm, shiftData.shift_id, (err,res) => {
        expect(res.status).toBe(200);
        done();
      })
    });

    test('should delete a shift I dont own at my farm. As owner', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let [anotherUserInMyFarm] = await mocks.userFarmFactory({promisedFarm: [userFarm]}, {status: 'Active', role_id: 3});
      let shiftData = await createShiftData(userFarm, anotherUserInMyFarm);
      deleteShift(userFarm, shiftData.shift_id, (err,res) => {
        expect(res.status).toBe(200);
        done();
      })
    });

    test('should delete a shift I own at my farm. As manager', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let shiftData = await createShiftData(userFarm);
      deleteShift(userFarm, shiftData.shift_id, (err,res) => {
        expect(res.status).toBe(200);
        done();
      })
    });

    test('should delete a shift I dont own at my farm. As manager', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 1});
      let [anotherUserInMyFarm] = await mocks.userFarmFactory({promisedFarm: [userFarm]}, {status: 'Active', role_id: 3});
      let shiftData = await createShiftData(userFarm, anotherUserInMyFarm);
      deleteShift(userFarm, shiftData.shift_id, (err,res) => {
        expect(res.status).toBe(200);
        done();
      })
    });

    test('should NOT delete a shift I own at my farm. As worker', async (done) => {
      let [userFarm] = await mocks.userFarmFactory({}, {status: 'Active', role_id: 3});
      let shiftData = await createShiftData(userFarm);
      deleteShift(userFarm, shiftData.shift_id, (err,res) => {
        expect(res.status).toBe(403);
        done();
      })
    });
  });

});
