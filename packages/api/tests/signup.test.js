/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (signup.test.js) is part of LiteFarm.
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
chai.use(chaiHttp);
const chai_assert = chai.assert;    // Using Assert style
const chai_expect = chai.expect;    // Using Expect style
const chai_should = chai.should();  // Using Should style
const server = 'http://localhost:5000';
const dummySignUp = require('./dummySignUp')
const authConfig = require ('../src/auth0Config')


describe('These are tests for auth0 signup and user creation', () => {
    let testSignUpToken = null;
    let oauth_user_id = null;
    let userID = null;

    test('POST to signup with oauth to get token', (done) => {
            chai.request(authConfig.token_url).post('/')
                .set(authConfig.token_headers)
                .send(authConfig.token_body)
                .end((err, res) => {
                        chai_expect(res.status).to.equal(200)
                        testSignUpToken = res.body.access_token;
                        done();
                    }
                )
        }
    )

    test('POST blank email/username to signup gives 400', (done) => {
        chai.request(authConfig.signup_url).post('/')
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer ' + testSignUpToken)
            .send(dummySignUp.emailBlankUser)
            .end((err, res) => {
                chai_expect(res.error).to.be.not.null
                chai_expect(res.status).to.equal(400)
                done();
            })
    })

    test('POST invalid email to signup gives 400', (done) => {
        chai.request(authConfig.signup_url).post('/')
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer ' + testSignUpToken)
            .send(dummySignUp.emailInvalidUser)
            .end((err, res) => {
                chai_expect(res.error).to.be.not.null
                chai_expect(res.status).to.equal(400)
                done();
            })
    })

    test('POST invalid password (no uppercase or lowercase) signup gives 400', (done) => {
        chai.request(authConfig.signup_url).post('/')
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer ' + testSignUpToken)
            .send(dummySignUp.passwordInvalidUserNoLowercaseUppercase)
            .end((err, res) => {
                chai_expect(res.error).to.be.not.null
                chai_expect(res.status).to.equal(400)
                done();
            })
    })

    test('POST invalid password (no special characters or numbers) signup gives 400', (done) => {
        chai.request(authConfig.signup_url).post('/')
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer ' + testSignUpToken)
            .send(dummySignUp.passwordInvalidUserNoSpecialCharactersOrNumbers)
            .end((err, res) => {
                chai_expect(res.error).to.be.not.null
                chai_expect(res.status).to.equal(400)
                done();
            })
    })

    test('POST valid signup user', (done) => {
        chai.request(authConfig.signup_url).post('/')
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer ' + testSignUpToken)
            .send(dummySignUp.validSignupUser)
            .end((err, res) => {
                chai_expect(res.body.email).to.equal(dummySignUp.validSignupUser.email)
                chai_expect(res.body.user_metadata).to.deep.equal(dummySignUp.validSignupUser.user_metadata)
                chai_expect(res.body._id).be.not.empty
                chai_expect(res.status).to.equal(200)
                done();
            })
    })


    test('GET user by email from oauth', (done) => {
        let email = dummySignUp.validSignupUser.email.replace('@', '%40')
        chai.request(authConfig.token_body.audience).get('users-by-email?email='+ email)
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer ' + testSignUpToken)
            .end((err, res) => {
                chai_expect(res.body[0]).to.be.not.null
                //oauth user id needed to delete user from oauth
                oauth_user_id = res.body[0].user_id
                //userID used to add to Users db
                userID = res.body[0].user_id.split('|')[1]
                chai_expect(res.status).to.equal(200)
                done();
            })
    })

    test('POST user to DB', (done) => {
        chai.request(server).post('/user/')
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer '+testSignUpToken)
            .send({...dummySignUp.validUserAdd, user_id: userID})
            .end((err, res) => {
                chai_expect(err).to.be.null;
                chai_expect(res.status).to.equal(201);
                done();
            });
    });

    test('GET user added from DB with userID gives 200', (done) => {
        chai.request(server).get('/user/' + userID)
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer '+testSignUpToken)
            .end((err, res) => {
                chai_expect(err).to.be.null;
                chai_expect(res.body[0].first_name).to.equal(dummySignUp.validUserAdd.first_name)
                chai_expect(res.body[0].last_name).to.equal(dummySignUp.validUserAdd.last_name)
                chai_expect(res.body[0].email).to.equal(dummySignUp.validUserAdd.email)
                // chai_expect(res.body[0].user_id).to.equal(userID)
                chai_expect(res.body).to.not.deep.equal([]);
                chai_expect(res.status).to.equal(200);
                done();
            });
    });

    test('GET user added from DB with userID gives 200', (done) => {
        chai.request(server).get('/user/' + 'd' +userID)
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer '+testSignUpToken)
            .end((err, res) => {
                chai_expect(err).to.be.null;
                chai_expect(res.body).to.deep.equal([]);
                chai_expect(res.status).to.equal(200);
                done();
            });
    });


    test('DELETE valid signup user from oauth', (done) => {
        chai.request(authConfig.user_url).delete('/' + oauth_user_id)
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer ' + testSignUpToken)
            .end((err, res) => {
                chai_expect(res.status).to.equal(204)
                done();
            })

    })

    test('GET user by email from oauth should give [] and 200', (done) => {
        let email = dummySignUp.validSignupUser.email.replace('@', '%40')
        chai.request(authConfig.token_body.audience).get('users-by-email?email='+ email)
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer ' + testSignUpToken)
            .end((err, res) => {
                chai_expect(res.body).to.deep.equal([])
                chai_expect(res.status).to.equal(200)
                done();
            })
    })

});