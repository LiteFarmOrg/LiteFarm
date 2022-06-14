const ensembleService = require('../src/util/ensemble');

describe('ensemble service', () => {
  test('invalid access token to yeild status 403', async () => {
    const orgId = 'org-5c36-11eb-b3aa-9f566fe0899e';
    const esids = ['123', '124', '125'];
    const access = 'ACCESS_TOKEN';
    const response = await ensembleService.bulkSensorClaim(orgId, esids, access);
    expect(response.status).toBe(403);
  });
});
