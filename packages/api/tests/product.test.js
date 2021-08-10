/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (product.test.js) is part of LiteFarm.
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
const moment =require('moment')
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment')
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks  = require('./mock.factories');


const productModel = require('../src/models/productModel');

describe('Product Tests', () => {
  let middleware;


  function postProductRequest( data, { user_id, farm_id }, callback) {
    chai.request(server).post(`/product`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest({user_id, farm_id }, callback) {
    chai.request(server).get(`/product/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function fakeUserFarm(role= 1){
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  function getFakeFertilizer(farm_id = farm.farm_id){
    const fertilizer = mocks.fakeFertilizer();
    return ({...fertilizer, farm_id});
  }

  beforeEach(async () => {

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next()
    });
  })

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Get products ',()=>{
    let userFarmToTest;
    beforeEach(async()=>{
      await knex('product').del();
      [userFarmToTest] = await mocks.userFarmFactory({}, fakeUserFarm());
    });

    test('Should get products on my farm', async (done) => {
      await Promise.all([...Array(10)].map(() =>
        mocks.productFactory({promisedFarm: [{farm_id: userFarmToTest.farm_id}]})
      ));
      getRequest({ user_id: userFarmToTest.user_id, farm_id: userFarmToTest.farm_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(10);
        done();
      });
    });

    test('Should get products on my farm as well as defaults', async (done) => {
      await Promise.all([...Array(10)].map(() =>
        mocks.productFactory({promisedFarm: [{farm_id: userFarmToTest.farm_id}]})
      ));
      await Promise.all([...Array(10)].map(() =>
        mocks.productFactory({promisedFarm: [{farm_id: null}]})
      ));
      getRequest({ user_id: userFarmToTest.user_id, farm_id: userFarmToTest.farm_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(20);
        done();
      });
    });

    test('should get products on my farm and defaults, but not my other farms', async (done) => {
      const [otherUserFarm] = await mocks.userFarmFactory({promisedUser : [{user_id: userFarmToTest.user_id}]});
      await Promise.all([...Array(10)].map(() =>
        mocks.productFactory({promisedFarm: [{farm_id: userFarmToTest.farm_id}]})
      ));
      await Promise.all([...Array(10)].map(() =>
        mocks.productFactory({promisedFarm: [{farm_id: null}]})
      ));
      const otherFarmProducts = await Promise.all([...Array(10)].map(() =>
        mocks.productFactory({promisedFarm: [{farm_id: otherUserFarm.farm_id}]})
      ));
      getRequest({user_id:userFarmToTest.user_id, farm_id: userFarmToTest.farm_id},(err,res)=>{
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(20);
        const ids = res.body.map( ({product_id}) => product_id);
        expect(otherFarmProducts.some(({ product_id }) => ids.includes(product_id))).toBe(false);
        done();
      });
    })

  })






  describe('Post product', () => {
    let prod;

    beforeEach(async()=>{
      prod = mocks.fakeProduct();
    })

    test('should return 403 status if headers.farm_id is set to null', async (done) => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());
      postProductRequest(prod, {user_id: userFarm.user_id, farm_id: null}, (err, res) => {
        expect(res.status).toBe(403);
        done()
      })
    });

    test('should successfully create a product with minimal data', async (done) => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());
      prod.farm_id = userFarm.farm_id;
      postProductRequest(prod, userFarm, (err, res) => {
        expect(res.status).toBe(201);
        done();
      });
    });

    describe('Post fertilizer authorization tests', ()=>{


      test('Owner should post and get product', async (done) => {
        const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        prod.farm_id = userFarm.farm_id;
        postProductRequest(prod, userFarm, async (err, res) => {
          expect(res.status).toBe(201);
          const productsSaved = await productModel.query().context({showHidden: true}).where('farm_id',userFarm.farm_id);
          expect(productsSaved.length).toBe(1);
          done();
        })
      });

      test('Manager should post and get a product', async (done) => {
        const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm(2));
        prod.farm_id = userFarm.farm_id;
        postProductRequest(prod, userFarm, async (err, res) => {
          expect(res.status).toBe(201);
          const products = await productModel.query().context({showHidden: true}).where('farm_id',userFarm.farm_id);
          expect(products.length).toBe(1);
          done();
        })
      });

      test('should return 403 status if product  is posted by worker', async (done) => {
        const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm(3));
        prod.farm_id = userFarm.farm_id;
        postProductRequest(prod, userFarm, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:product");
          done()
        })
      });

    })


  });
});
