const mocks  = require('./mock.factories');
const Knex = require('knex')
const environment = 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);

describe('Factories tests', () => {
  const factories = Object.keys(mocks).filter(k => k.endsWith('Factory'));
  const tableNames = factories.map(factoryName =>  factoryName.replace('Factory', ''));

  tableNames.map((tableName, i) => {
      test(`should create one row of ${tableName} using its factory`, async (done) => {
        const [result] = await mocks[factories[i]]() // factories[i] will be the table name factory as defined in the mock.factories
        expect(result).toBeDefined();
        const ids = Object.keys(result).reduce((obj, k) => k.includes('_id') ? {[k]: result[k], ...obj}: obj , {})
        const checker = await knex(tableName).where(ids);
        expect(checker.length).toBe(1);
        done();
      })
  })

  afterAll(() => {
    tableNames.unshift('userFarm', 'activityLog')
    Promise.all(tableNames.map((table) => {
      return knex(table).delete()
    })).then(() => {
      console.log('successfully deleted tables')
    }).catch(console.log)
  })
})
