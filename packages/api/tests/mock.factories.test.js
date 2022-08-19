import mocks from './mock.factories.js';
import { tableCleanup } from './testEnvironment.js';
import knex from '../src/util/knex.js';

describe('Factories tests', () => {
  const factories = Object.keys(mocks).filter((k) => k.endsWith('Factory'));
  const tableNames = factories.map((factoryName) => factoryName.replace('Factory', ''));

  tableNames.map((tableName, i) => {
    test(`should create one row of ${tableName} using its factory`, async (done) => {
      const [result] = await mocks[factories[i]](); // factories[i] will be the table name factory as defined in the mock.factories
      expect(result).toBeDefined();
      const ids = Object.keys(result).reduce(
        (obj, k) => (k.includes('_id') ? { [k]: result[k], ...obj } : obj),
        {},
      );
      const checker = await knex(tableName).where(ids);
      expect(checker.length).toBe(1);
      done();
    });
  });

  afterAll(async (done) => {
    try {
      await tableCleanup(knex);
      await knex.destroy();
      done();
    } catch (e) {
      console.log(e);
      console.log('Failed cleanup');
    }
  });
});
