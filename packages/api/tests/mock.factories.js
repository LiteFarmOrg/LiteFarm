const Knex = require('knex')
const environment = 'test';
const config = require('../knexfile')[environment];
let faker = require('faker');

function createUser(userObject = fakeUser()) {
  return Knex('users').insert(userObject).returning('*');
}

function fakeUser() {
  return {
    first_name: faker.name.findName(),
    last_name: faker.name.findLast()
  }
}

function seedUsers(numberOfUsersToSeed) {
  [...Array(numberOfUsersToSeed)].forEach(() => {
    return createUser();
  })
}
