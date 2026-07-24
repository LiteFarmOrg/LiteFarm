/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
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

import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
import mocks from './mock.factories.js';
import { createUserFarmIds } from './utils/testDataSetup.js';
import { PGS_TRANSLATION_KEY } from '../src/middleware/validation/checkCertification.js';

jest.mock('jsdom');
jest.mock('bull');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);

// Mock partner webhook-calling service
jest.mock('../src/services/datafoodconsortium/dfcWebhook.js', () => ({
  notifyPartnerRefresh: jest.fn().mockResolvedValue(undefined),
}));

import { notifyPartnerRefresh } from '../src/services/datafoodconsortium/dfcWebhook.js';
const mockedNotifyPartnerRefresh = notifyPartnerRefresh as jest.MockedFunction<
  typeof notifyPartnerRefresh
>;

// Mock S3/imaginary so file upload tests work without live infrastructure
jest.mock('../src/util/digitalOceanSpaces.js', () => ({
  s3: { send: jest.fn().mockResolvedValue({}) },
  getPrivateS3BucketName: jest.fn().mockReturnValue('test-bucket'),
  getPrivateS3Url: jest.fn().mockReturnValue('http://localhost:9000/test-bucket'),
  getRandomFileName: jest.fn().mockImplementation((file) => `random-uuid-${file.originalname}`),
  getFileNameWithOriginalName: jest
    .fn()
    .mockImplementation((file) => `random-uuid-${file.originalname}`),
  imaginaryPost: jest.fn().mockResolvedValue({ data: Buffer.from('fake-image') }),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: jest.fn().mockImplementation((args) => args),
}));

interface UserFarmIds {
  user_id: string;
  farm_id: string;
}

interface Certifier {
  certifier_id: number;
  system_type_id: number;
  certifier_name: string;
}

async function getRequest({ user_id, farm_id }: UserFarmIds) {
  return chai
    .request(server)
    .get('/certifications')
    .set('user_id', user_id)
    .set('farm_id', farm_id);
}

async function postRequest(data: object, { user_id, farm_id }: UserFarmIds) {
  return chai
    .request(server)
    .post('/certifications')
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
}

async function putRequest(id: number, data: object, { user_id, farm_id }: UserFarmIds) {
  return chai
    .request(server)
    .put(`/certifications/${id}`)
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
}

async function deleteRequest(id: number, { user_id, farm_id }: UserFarmIds) {
  return chai
    .request(server)
    .delete(`/certifications/${id}`)
    .set('user_id', user_id)
    .set('farm_id', farm_id);
}

async function exportRequest(data: object, { user_id, farm_id }: UserFarmIds) {
  return chai
    .request(server)
    .post('/certifications/request_export')
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
}

describe('Certifications CRUD tests', () => {
  let thirdPartyCertifier: Certifier;
  let thirdPartySystemTypeId: number;
  let pgsSystemTypeId: number;

  function validCertificationBody(overrides: object = {}) {
    return {
      system_type_id: thirdPartySystemTypeId,
      certifier_id: thirdPartyCertifier.certifier_id,
      is_active: true,
      certification_type: 'ORGANIC',
      certificate_number: 'CAN-ORG-2024-01567',
      issue_date: '2024-01-01',
      valid_until: '2026-12-31',
      ...overrides,
    };
  }

  async function createCertification(userFarmIds: UserFarmIds, overrides: object = {}) {
    const [certification] = await mocks.certificationFactory(
      { promisedUserFarm: Promise.resolve([userFarmIds]) },
      mocks.fakeCertification(userFarmIds.farm_id, {
        system_type_id: thirdPartySystemTypeId,
        certifier_id: thirdPartyCertifier.certifier_id,
        certification_type: 'ORGANIC',
        certificate_number: 'CAN-ORG-2024-01567',
        issue_date: '2024-01-01',
        valid_until: '2026-12-31',
        ...overrides,
      }),
    );
    return certification;
  }

  beforeAll(async () => {
    const pgsSystemType = await knex('certification_system_type')
      .where({ translation_key: PGS_TRANSLATION_KEY })
      .first();
    pgsSystemTypeId = pgsSystemType.id;

    const thirdPartySystemType = await knex('certification_system_type')
      .where({ translation_key: 'THIRD_PARTY_ORGANIC' })
      .orderBy('id')
      .first();
    thirdPartySystemTypeId = thirdPartySystemType.id;

    thirdPartyCertifier = await knex('certifiers')
      .where({ system_type_id: thirdPartySystemTypeId })
      .orderBy('certifier_id')
      .first();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('GET /certifications', () => {
    test('Admin users can list certifications', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const certification = await createCertification(userFarmIds);

      for (const roleId of [1, 2, 5]) {
        const [{ user_id }] = await mocks.userFarmFactory({
          promisedFarm: Promise.resolve([{ farm_id: userFarmIds.farm_id }]),
          roleId,
        });

        const res = await getRequest({ user_id, farm_id: userFarmIds.farm_id });

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        const [returned] = res.body;
        expect(returned.id).toBe(certification.id);
        expect(returned.system_type_id).toBe(thirdPartySystemTypeId);
        expect(returned.certificate_number).toBe('CAN-ORG-2024-01567');
      }
    });

    test('Returns an empty array when the farm has no certifications', async () => {
      const userFarmIds = await createUserFarmIds(1);

      const res = await getRequest(userFarmIds);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('Excludes soft-deleted certifications', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const certification = await createCertification(userFarmIds);
      await knex('certification').where({ id: certification.id }).update({ deleted: true });

      const res = await getRequest(userFarmIds);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test("Should not get other farms' certifications", async () => {
      const userFarmIds = await createUserFarmIds(1);
      const otherUserFarmIds = await createUserFarmIds(1);
      await createCertification(otherUserFarmIds);

      const res = await getRequest(userFarmIds);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('Workers cannot list certifications', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const [{ user_id }] = await mocks.userFarmFactory({
        promisedFarm: Promise.resolve([{ farm_id: userFarmIds.farm_id }]),
        roleId: 3,
      });

      const res = await getRequest({ user_id, farm_id: userFarmIds.farm_id });

      expect(res.status).toBe(403);
    });

    test('Members of another farm cannot list certifications', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const otherUserFarmIds = await createUserFarmIds(1);

      const res = await getRequest({
        user_id: otherUserFarmIds.user_id,
        farm_id: userFarmIds.farm_id,
      });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /certifications', () => {
    test('Admin users can add a certification', async () => {
      const userFarmIds = await createUserFarmIds(1);

      for (const roleId of [1, 2, 5]) {
        const [{ user_id }] = await mocks.userFarmFactory({
          promisedFarm: Promise.resolve([{ farm_id: userFarmIds.farm_id }]),
          roleId,
        });

        const res = await postRequest(validCertificationBody(), {
          user_id,
          farm_id: userFarmIds.farm_id,
        });

        expect(res.status).toBe(201);
        expect(res.body.system_type_id).toBe(thirdPartySystemTypeId);
        const persisted = await knex('certification').where({ id: res.body.id }).first();
        expect(persisted.farm_id).toBe(userFarmIds.farm_id);
        expect(persisted.certificate_number).toBe('CAN-ORG-2024-01567');
      }
    });

    test('Workers cannot add a certification', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const [{ user_id }] = await mocks.userFarmFactory({
        promisedFarm: Promise.resolve([{ farm_id: userFarmIds.farm_id }]),
        roleId: 3,
      });

      const res = await postRequest(validCertificationBody(), {
        user_id,
        farm_id: userFarmIds.farm_id,
      });

      expect(res.status).toBe(403);
    });

    describe('Validation', () => {
      let userFarmIds: UserFarmIds;

      beforeEach(async () => {
        userFarmIds = await createUserFarmIds(1);
      });

      const mandatoryFields = [
        'system_type_id',
        'is_active',
        'certification_type',
        'issue_date',
        'valid_until',
      ];
      test.each(mandatoryFields)('Rejects a missing %s', async (field) => {
        const res = await postRequest(validCertificationBody({ [field]: undefined }), userFarmIds);
        expect(res.status).toBe(400);
      });

      test('Rejects a missing certifier', async () => {
        const res = await postRequest(
          validCertificationBody({ certifier_id: undefined, other_certifier: undefined }),
          userFarmIds,
        );
        expect(res.status).toBe(400);
      });

      test('Rejects both certifier_id and other_certifier', async () => {
        const res = await postRequest(
          validCertificationBody({ other_certifier: 'Some Certifier' }),
          userFarmIds,
        );
        expect(res.status).toBe(400);
      });

      test('Rejects a certifier_id that does not match system_type_id', async () => {
        const res = await postRequest(
          validCertificationBody({
            system_type_id: pgsSystemTypeId,
            certificate_number: undefined,
            certificate_member_id: 'MEMBER-1',
          }),
          userFarmIds,
        );
        expect(res.status).toBe(400);
      });

      test('Rejects certificate_member_id for an active third-party certification', async () => {
        const res = await postRequest(
          validCertificationBody({ certificate_member_id: 'MEMBER-1' }),
          userFarmIds,
        );
        expect(res.status).toBe(400);
      });

      test('Rejects a missing certificate_number for an active third-party certification', async () => {
        const res = await postRequest(
          validCertificationBody({ certificate_number: undefined }),
          userFarmIds,
        );
        expect(res.status).toBe(400);
      });

      test('Rejects certificate_number for an active PGS certification', async () => {
        const res = await postRequest(
          validCertificationBody({
            system_type_id: pgsSystemTypeId,
            certifier_id: undefined,
            other_certifier: 'PGS Group',
            certificate_member_id: 'MEMBER-1',
          }),
          userFarmIds,
        );
        expect(res.status).toBe(400);
      });

      test('Rejects a missing certificate_member_id for an active PGS certification', async () => {
        const res = await postRequest(
          validCertificationBody({
            system_type_id: pgsSystemTypeId,
            certifier_id: undefined,
            other_certifier: 'PGS Group',
            certificate_number: undefined,
          }),
          userFarmIds,
        );
        expect(res.status).toBe(400);
      });

      test('Accepts an active PGS certification with other_certifier and member id', async () => {
        const res = await postRequest(
          validCertificationBody({
            system_type_id: pgsSystemTypeId,
            certifier_id: undefined,
            other_certifier: 'PGS Group',
            certificate_number: undefined,
            certificate_member_id: 'MEMBER-1',
          }),
          userFarmIds,
        );
        expect(res.status).toBe(201);
      });

      test('Accepts an inactive certification without number, member id, or dates', async () => {
        const res = await postRequest(
          validCertificationBody({
            is_active: false,
            certificate_number: undefined,
            issue_date: undefined,
            valid_until: undefined,
          }),
          userFarmIds,
        );
        expect(res.status).toBe(201);
      });
    });
  });

  describe('PUT /certifications/:id', () => {
    test('Updates and replaces all mutable fields', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const certification = await createCertification(userFarmIds, {
        certifier_id: null,
        other_certifier: 'Some Old Certifier',
      });

      // Body omits other_certifier (uses certifier_id instead) — full-replace semantics clear it
      const res = await putRequest(
        certification.id,
        validCertificationBody({ certificate_number: 'NEW-NUMBER-99' }),
        userFarmIds,
      );

      expect(res.status).toBe(200);
      expect(res.body.certificate_number).toBe('NEW-NUMBER-99');

      const persisted = await knex('certification').where({ id: certification.id }).first();
      expect(persisted.certificate_number).toBe('NEW-NUMBER-99');
      expect(persisted.other_certifier).toBeNull();
      expect(persisted.updated_by_user_id).toBe(userFarmIds.user_id);
    });

    test('Returns 404 for a soft-deleted certification', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const certification = await createCertification(userFarmIds);
      await knex('certification').where({ id: certification.id }).update({ deleted: true });

      const res = await putRequest(certification.id, validCertificationBody(), userFarmIds);

      expect(res.status).toBe(404);
    });

    test('Returns 403 for a nonexistent id (hasFarmAccess middleware behavior)', async () => {
      const userFarmIds = await createUserFarmIds(1);

      const res = await putRequest(99999999, validCertificationBody(), userFarmIds);

      expect(res.status).toBe(403);
    });

    test("Returns 403 when targeting another farm's certification", async () => {
      const userFarmIds = await createUserFarmIds(1);
      const otherUserFarmIds = await createUserFarmIds(1);
      const certification = await createCertification(otherUserFarmIds);

      const res = await putRequest(certification.id, validCertificationBody(), userFarmIds);

      expect(res.status).toBe(403);
    });

    test('Rejects an invalid certification_type', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const certification = await createCertification(userFarmIds);

      const res = await putRequest(
        certification.id,
        validCertificationBody({ certification_type: 'NOT_A_TYPE' }),
        userFarmIds,
      );

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /certifications/:id', () => {
    test('Soft-deletes a certification', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const certification = await createCertification(userFarmIds);

      const res = await deleteRequest(certification.id, userFarmIds);

      expect(res.status).toBe(204);
      const persisted = await knex('certification').where({ id: certification.id }).first();
      expect(persisted.deleted).toBe(true);
    });

    test('Returns 404 when deleting an already-deleted certification', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const certification = await createCertification(userFarmIds);

      await deleteRequest(certification.id, userFarmIds);
      const res = await deleteRequest(certification.id, userFarmIds);

      expect(res.status).toBe(404);
    });

    test('Workers cannot delete a certification', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const certification = await createCertification(userFarmIds);
      const [{ user_id }] = await mocks.userFarmFactory({
        promisedFarm: Promise.resolve([{ farm_id: userFarmIds.farm_id }]),
        roleId: 3,
      });

      const res = await deleteRequest(certification.id, {
        user_id,
        farm_id: userFarmIds.farm_id,
      });

      expect(res.status).toBe(403);
    });

    test("Returns 403 when deleting another farm's certification", async () => {
      const userFarmIds = await createUserFarmIds(1);
      const otherUserFarmIds = await createUserFarmIds(1);
      const certification = await createCertification(otherUserFarmIds);

      const res = await deleteRequest(certification.id, userFarmIds);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /certifications/request_export', () => {
    test('Exports for the certification matching the given certifier', async () => {
      const userFarmIds = await createUserFarmIds(1);
      await createCertification(userFarmIds);

      const res = await exportRequest(
        {
          certifier_id: thirdPartyCertifier.certifier_id,
          from_date: '2026-01-01',
          to_date: '2026-06-30',
        },
        userFarmIds,
      );

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Processing');
    });

    test('Returns 400 when dates are missing', async () => {
      const userFarmIds = await createUserFarmIds(1);
      await createCertification(userFarmIds);

      const res = await exportRequest(
        { certifier_id: thirdPartyCertifier.certifier_id },
        userFarmIds,
      );

      expect(res.status).toBe(400);
    });

    test('Returns 400 when no certification matches the given certifier', async () => {
      const userFarmIds = await createUserFarmIds(1);
      await createCertification(userFarmIds, { certifier_id: null, other_certifier: 'Someone' });

      const res = await exportRequest(
        {
          certifier_id: thirdPartyCertifier.certifier_id,
          from_date: '2026-01-01',
          to_date: '2026-06-30',
        },
        userFarmIds,
      );

      expect(res.status).toBe(400);
    });

    test('Workers cannot request an export', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const [{ user_id }] = await mocks.userFarmFactory({
        promisedFarm: Promise.resolve([{ farm_id: userFarmIds.farm_id }]),
        roleId: 3,
      });

      const res = await exportRequest(
        {
          certifier_id: thirdPartyCertifier.certifier_id,
          from_date: '2026-01-01',
          to_date: '2026-06-30',
        },
        { user_id, farm_id: userFarmIds.farm_id },
      );

      expect(res.status).toBe(403);
    });
  });

  describe('Partner webhook notifications', () => {
    async function setupFarmWithPartner(userFarmIds: UserFarmIds) {
      const [marketDirectoryInfo] = await mocks.market_directory_infoFactory({
        promisedUserFarm: Promise.resolve([userFarmIds]),
      });
      const [partner] = await mocks.market_directory_partnerFactory();
      const webhookUrl = `https://partner-${partner.id}.example.com/webhook`;
      await mocks.market_directory_partner_authFactory(
        { promisedPartner: Promise.resolve([partner]) },
        mocks.fakeMarketDirectoryPartnerAuth({ webhook_endpoint: webhookUrl }),
      );
      await mocks.market_directory_partner_permissionsFactory({
        promisedDirectoryInfo: Promise.resolve([marketDirectoryInfo]),
        promisedPartner: Promise.resolve([partner]),
      });
      return webhookUrl;
    }

    const flushWebhooks = () => new Promise((resolve) => setTimeout(resolve, 100));

    test('Notifies permitted partners after a successful write', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const webhookUrl = await setupFarmWithPartner(userFarmIds);

      const postRes = await postRequest(validCertificationBody(), userFarmIds);
      expect(postRes.status).toBe(201);
      await flushWebhooks();
      expect(mockedNotifyPartnerRefresh).toHaveBeenCalledWith(webhookUrl);

      jest.clearAllMocks();
      const putRes = await putRequest(postRes.body.id, validCertificationBody(), userFarmIds);
      expect(putRes.status).toBe(200);
      await flushWebhooks();
      expect(mockedNotifyPartnerRefresh).toHaveBeenCalledWith(webhookUrl);

      jest.clearAllMocks();
      const deleteRes = await deleteRequest(postRes.body.id, userFarmIds);
      expect(deleteRes.status).toBe(204);
      await flushWebhooks();
      expect(mockedNotifyPartnerRefresh).toHaveBeenCalledWith(webhookUrl);
    });

    test('Does not notify when the farm is not in the market directory', async () => {
      const userFarmIds = await createUserFarmIds(1);

      const res = await postRequest(validCertificationBody(), userFarmIds);

      expect(res.status).toBe(201);
      await flushWebhooks();
      expect(mockedNotifyPartnerRefresh).not.toHaveBeenCalled();
    });

    test('Does not notify when the write fails', async () => {
      const userFarmIds = await createUserFarmIds(1);
      await setupFarmWithPartner(userFarmIds);

      const res = await postRequest(
        validCertificationBody({ certification_type: 'NOT_A_TYPE' }),
        userFarmIds,
      );

      expect(res.status).toBe(400);
      await flushWebhooks();
      expect(mockedNotifyPartnerRefresh).not.toHaveBeenCalled();
    });
  });
});
