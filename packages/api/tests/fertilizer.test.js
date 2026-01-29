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

import chai from 'chai';

import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import server from './../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import fertilizerModel from '../src/models/fertilizerModel.js';

describe('Fertilizer Tests', () => {
  let owner;
  let farm;

  async function postFertilizerRequest(
    data,
    { user_id = owner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    return chai
      .request(server)
      .post(`/fertilizer/farm/${farm_id}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .then((res) => callback(null, res))
      .catch((_err) => callback(_err));
  }

  async function getRequest({ user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    return chai
      .request(server)
      .get(`/fertilizer/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .then((res) => callback(null, res))
      .catch((_err) => callback(_err));
  }

  async function deleteRequest(
    { user_id = owner.user_id, farm_id = farm.farm_id, fertilizer_id },
    callback,
  ) {
    return chai
      .request(server)
      .delete(`/fertilizer/${fertilizer_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .then((res) => callback(null, res))
      .catch((_err) => callback(_err));
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function getFakeFertilizer(farm_id = farm.farm_id) {
    const fertilizer = mocks.fakeFertilizer();
    return { ...fertilizer, farm_id };
  }

  beforeEach(async () => {
    await knex.raw('DELETE from fertilizer');
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [_ownerFarm] = await mocks.userFarmFactory(
      { promisedUser: [owner], promisedFarm: [farm] },
      fakeUserFarm(1),
    );
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('Get && delete fertilizer', () => {
    let fertilizer;
    beforeEach(async () => {
      [fertilizer] = await mocks.fertilizerFactory({ promisedFarm: [farm] });
    });

    test('Should filter out deleted fertilizer', async () => {
      await fertilizerModel
        .query()
        .context({
          showHidden: true,
          user_id: owner.user_id,
        })
        .findById(fertilizer.fertilizer_id)
        .delete();
      await getRequest({ user_id: owner.user_id }, (_err, res) => {
        expect(res.status).toBe(404);
      });
    });

    test('should get seeded fertilizer', async () => {
      const [seedFertilizer] = await mocks.fertilizerFactory(
        { promisedFarm: [{ farm_id: null }] },
        mocks.fakeFertilizer(),
      );
      await getRequest({ user_id: owner.user_id }, (_err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[1].fertilizer_id).toBe(seedFertilizer.fertilizer_id);
      });
    });

    describe('Get fertilizer authorization tests', () => {
      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        const [_workerFarm] = await mocks.userFarmFactory(
          { promisedUser: [worker], promisedFarm: [farm] },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        const [_managerFarm] = await mocks.userFarmFactory(
          { promisedUser: [manager], promisedFarm: [farm] },
          fakeUserFarm(2),
        );

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [_ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          { promisedUser: [unAuthorizedUser], promisedFarm: [farmunAuthorizedUser] },
          fakeUserFarm(1),
        );
      });

      test('Owner should get fertilizer by farm id', async () => {
        await getRequest({ user_id: owner.user_id }, (_err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
        });
      });

      test('Manager should get fertilizer by farm id', async () => {
        await getRequest({ user_id: manager.user_id }, (_err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
        });
      });

      test('Worker should get fertilizer by farm id', async () => {
        await getRequest({ user_id: worker.user_id }, (_err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
        });
      });

      test('Should get status 403 if an unauthorizedUser tries to get fertilizer by farm id', async () => {
        await getRequest({ user_id: unAuthorizedUser.user_id }, (_err, res) => {
          expect(res.status).toBe(403);
        });
      });
    });

    describe('Delete fertlizer', function () {
      test('should return 403 if user tries to delete a seeded fertilizer', async () => {
        const [seedFertilizer] = await mocks.fertilizerFactory(
          { promisedFarm: [{ farm_id: null }] },
          mocks.fakeFertilizer(),
        );
        await deleteRequest({ fertilizer_id: seedFertilizer.fertilizer_id }, async (_err, res) => {
          expect(res.status).toBe(403);
        });
      });

      describe('Delete fertlizer authorization tests', () => {
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [worker] = await mocks.usersFactory();
          const [_workerFarm] = await mocks.userFarmFactory(
            { promisedUser: [worker], promisedFarm: [farm] },
            fakeUserFarm(3),
          );
          [manager] = await mocks.usersFactory();
          const [_managerFarm] = await mocks.userFarmFactory(
            { promisedUser: [manager], promisedFarm: [farm] },
            fakeUserFarm(2),
          );

          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [_ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
            { promisedUser: [unAuthorizedUser], promisedFarm: [farmunAuthorizedUser] },
            fakeUserFarm(1),
          );
        });

        test('Owner should delete a fertlizer', async () => {
          await deleteRequest({ fertilizer_id: fertilizer.fertilizer_id }, async (_err, res) => {
            expect(res.status).toBe(200);
            const fertilizerRes = await fertilizerModel
              .query()
              .context({ showHidden: true })
              .where('fertilizer_id', fertilizer.fertilizer_id);
            expect(fertilizerRes.length).toBe(1);
            expect(fertilizerRes[0].deleted).toBe(true);
          });
        });

        test('Manager should delete a fertilizer', async () => {
          await deleteRequest(
            { user_id: manager.user_id, fertilizer_id: fertilizer.fertilizer_id },
            async (_err, res) => {
              expect(res.status).toBe(200);
              const fertilizerRes = await fertilizerModel
                .query()
                .context({ showHidden: true })
                .where('fertilizer_id', fertilizer.fertilizer_id);
              expect(fertilizerRes.length).toBe(1);
              expect(fertilizerRes[0].deleted).toBe(true);
            },
          );
        });

        test('should return 403 if an unauthorized user tries to delete a fertilizer', async () => {
          await deleteRequest(
            { user_id: unAuthorizedUser.user_id, fertilizer_id: fertilizer.fertilizer_id },
            async (_err, res) => {
              expect(res.status).toBe(403);
            },
          );
        });

        test('should return 403 if a worker tries to delete a fertilizer', async () => {
          await deleteRequest(
            { user_id: worker.user_id, fertilizer_id: fertilizer.fertilizer_id },
            async (_err, res) => {
              expect(res.status).toBe(403);
            },
          );
        });

        test('Circumvent authorization by modifying farm_id', async () => {
          await deleteRequest(
            {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              fertilizer_id: fertilizer.fertilizer_id,
            },
            async (_err, res) => {
              expect(res.status).toBe(403);
            },
          );
        });
      });
    });
  });

  describe('Post fertilizer', () => {
    let fakeFertilizer;

    beforeEach(async () => {
      fakeFertilizer = getFakeFertilizer();
    });

    test('should return 403 status if headers.farm_id is set to null', async () => {
      fakeFertilizer.farm_id = null;
      await postFertilizerRequest(fakeFertilizer, {}, (_err, res) => {
        expect(res.status).toBe(403);
      });
    });

    describe('Post fertilizer authorization tests', () => {
      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        const [_workerFarm] = await mocks.userFarmFactory(
          { promisedUser: [worker], promisedFarm: [farm] },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        const [_managerFarm] = await mocks.userFarmFactory(
          { promisedUser: [manager], promisedFarm: [farm] },
          fakeUserFarm(2),
        );

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [_ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          { promisedUser: [unAuthorizedUser], promisedFarm: [farmunAuthorizedUser] },
          fakeUserFarm(1),
        );
      });

      test('Owner should post and get a valid crop', async () => {
        await postFertilizerRequest(fakeFertilizer, {}, async (_err, res) => {
          expect(res.status).toBe(201);
          const fertilizers = await fertilizerModel
            .query()
            .context({ showHidden: true })
            .where('farm_id', farm.farm_id);
          expect(fertilizers.length).toBe(1);
          expect(fertilizers[0].fertilizer_type).toBe(fakeFertilizer.fertilizer_type);
        });
      });

      test('Manager should post and get a valid crop', async () => {
        await postFertilizerRequest(
          fakeFertilizer,
          { user_id: manager.user_id },
          async (_err, res) => {
            expect(res.status).toBe(201);
            const fertilizers = await fertilizerModel
              .query()
              .context({ showHidden: true })
              .where('farm_id', farm.farm_id);
            expect(fertilizers.length).toBe(1);
            expect(fertilizers[0].fertilizer_type).toBe(fakeFertilizer.fertilizer_type);
          },
        );
      });

      test('should return 403 status if fertilizer is posted by worker', async () => {
        await postFertilizerRequest(
          fakeFertilizer,
          { user_id: worker.user_id },
          async (_err, res) => {
            expect(res.status).toBe(403);
            expect(res.error.text).toBe(
              'User does not have the following permission(s): add:fertilizers',
            );
          },
        );
      });

      test('should return 403 status if fertilizer is posted by unauthorized user', async () => {
        await postFertilizerRequest(
          fakeFertilizer,
          { user_id: unAuthorizedUser.user_id },
          async (_err, res) => {
            expect(res.status).toBe(403);
            expect(res.error.text).toBe(
              'User does not have the following permission(s): add:fertilizers',
            );
          },
        );
      });

      test('Circumvent authorization by modify farm_id', async () => {
        await postFertilizerRequest(
          fakeFertilizer,
          { user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id },
          async (_err, res) => {
            expect(res.status).toBe(403);
          },
        );
      });
    });
  });
});
