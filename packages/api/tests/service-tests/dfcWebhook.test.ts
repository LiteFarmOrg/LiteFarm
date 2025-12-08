/*
 *  Copyright 2025 LiteFarm.org
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

import axios from 'axios';
import {
  notifyPartnerRefresh,
  WebhookEventType,
  Scope,
} from '../../src/services/datafoodconsortium/dfcWebhook.js';
import { getAccessToken } from '../../src/services/keycloak.js';

jest.mock('axios');
jest.mock('../../src/services/keycloak.js', () => ({
  getAccessToken: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;

describe('DFC Webhook Service', () => {
  const mockWebhookUrl = 'https://example.com/webhook';
  const mockAccessToken = 'mock-token-12345';

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue(mockAccessToken);
    mockedAxios.post.mockResolvedValue({ status: 200, data: {} });

    // Suppress console output during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('notifyPartnerRefresh', () => {
    test('should send refresh webhook with correct payload and token', async () => {
      const result = await notifyPartnerRefresh(mockWebhookUrl);

      expect(mockedGetAccessToken).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        mockWebhookUrl,
        expect.objectContaining({
          eventType: WebhookEventType.REFRESH,
          scope: Scope.READ_ENTERPRISE,
          enterpriseUrlid: expect.stringContaining('/enterprises'),
        }),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }),
      );
      expect(result.payload.eventType).toBe(WebhookEventType.REFRESH);
    });

    test('should respect dry-run flag and return expected structure', async () => {
      const result = await notifyPartnerRefresh(mockWebhookUrl, true);

      expect(mockedGetAccessToken).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();

      expect(result).toMatchObject({
        sentTo: mockWebhookUrl,
        payload: {
          eventType: WebhookEventType.REFRESH,
          scope: Scope.READ_ENTERPRISE,
          enterpriseUrlid: expect.stringContaining('/enterprises'),
        },
        dryRun: true,
      });

      expect(result.responseStatus).toBeUndefined();
      expect(result.responseData).toBeUndefined();
    });

    test('should throw error when webhook URL is missing', async () => {
      await expect(notifyPartnerRefresh('')).rejects.toThrow('Webhook URL not given');

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('should return Keycloak errors with context', async () => {
      const keycloakError = new Error('Keycloak connection failed');
      mockedGetAccessToken.mockRejectedValue(keycloakError);

      await expect(notifyPartnerRefresh(mockWebhookUrl)).rejects.toMatchObject({
        message: expect.stringContaining('Failed to send webhook'),
        cause: keycloakError, // original error preserved
      });

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('should retry webhook 3 times on partner server errors', async () => {
      const mockAxiosError = {
        isAxiosError: true,
        response: { status: 500, data: { error: 'Server error' } },
        message: 'Internal Server Error',
      };

      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.post.mockRejectedValue(mockAxiosError);

      await expect(notifyPartnerRefresh(mockWebhookUrl)).rejects.toMatchObject({
        message: expect.stringContaining('Failed to send webhook'),
        cause: mockAxiosError,
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
      expect(mockedGetAccessToken).toHaveBeenCalledTimes(3);
    });

    test('should not retry webhook on client errors', async () => {
      const mockAxiosError = {
        isAxiosError: true,
        response: { status: 400, data: { error: 'Bad request' } },
        message: 'Bad Request',
      };

      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.post.mockRejectedValue(mockAxiosError);

      await expect(notifyPartnerRefresh(mockWebhookUrl)).rejects.toMatchObject({
        message: expect.stringContaining('Failed to send webhook'),
        cause: mockAxiosError,
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedGetAccessToken).toHaveBeenCalledTimes(1);
    });
  });
});
