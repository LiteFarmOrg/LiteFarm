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
import { getAccessToken } from '../keycloak.js';
import { createEnterpriseUrl } from './dfcAdapter.js';

/**
 * Webhook implementation for Data Food Consortium proxy notification.
 *
 * Based on Startinblox DFC Data Server Development Guide:
 * https://git.startinblox.com/projets/projets-clients/open-food-network/data-permissioning-module/-/wikis/Data-Server-Development-Guide
 *
 * but simplified for MVP1:
 * - Single event type (refresh)
 * - Single scope (ReadEnterprise)
 * - enterpriseUrlid always points to our enterprises endpoint
 *
 * (Simplification reference is the OFN-QCCM implementation)
 */

/**
 * Event types per DFC Data Server Development Guide
 */
export enum WEBHOOK_EVENT_TYPES {
  REFRESH = 'refresh',
}

/* Scopes per DFC Data Server Development Guide */
export enum SCOPES {
  READ_ENTERPRISE = 'ReadEnterprise',
}

/**
 * URL for all refresh webhook notifications
 */
const REFRESH_ENTERPRISES_URL = createEnterpriseUrl('');

interface RefreshWebhookPayload {
  eventType: WEBHOOK_EVENT_TYPES.REFRESH;
  enterpriseUrlid: string;
  scope: SCOPES.READ_ENTERPRISE;
}

/**
 * Sends a 'refresh' notification to proxy when permissions or directory data changes
 */
export async function notifyProxyRefresh(
  webhookUrl: string,
  dryRun = false,
): Promise<WebhookResult> {
  return sendWebhook(
    webhookUrl,
    {
      eventType: WEBHOOK_EVENT_TYPES.REFRESH,
      enterpriseUrlid: REFRESH_ENTERPRISES_URL,
      scope: SCOPES.READ_ENTERPRISE,
    },
    dryRun,
  );
}

type WebhookPayload = RefreshWebhookPayload;

/**
 * Sends webhook notification to proxy server with authentication
 *
 * @throws {Error} If webhook URL is missing or request fails
 */
interface WebhookResult {
  sentTo: string;
  payload: WebhookPayload;
  responseStatus?: number;
  responseData?: unknown;
  dryRun: boolean;
}

export async function sendWebhook(
  webhookUrl: string,
  payload: WebhookPayload,
  dryRun: boolean,
  retries = 2, // default of 3 total attempts
): Promise<WebhookResult> {
  if (!webhookUrl) {
    throw new Error('Webhook URL not given');
  }

  if (dryRun) {
    return {
      sentTo: webhookUrl,
      payload,
      dryRun,
    };
  }

  let response;

  try {
    // Step 1: Get access token from Keycloak
    const accessToken = await getAccessToken();

    // Step 2: Call the webhook with authentication
    response = await axios.post(
      webhookUrl, // e.g., 'https://ofn.example.com/dfc/webhook/'
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // wait up to 10 seconds for the webhook to respond
      },
    );

    console.log('Webhook sent successfully:', {
      eventType: payload.eventType,
      timestamp: new Date().toISOString(),
      webhookUrl,
    });
  } catch (error) {
    const message =
      axios.isAxiosError(error) || error instanceof Error ? error.message : 'Unknown error';

    if (retries && isRetriableError(error)) {
      console.warn(`Webhook failed, retrying... (${retries} attempts remaining)`, {
        webhookUrl,
        error: message,
      });

      // Wait a bit before retrying
      const delayMs = (3 - retries) * 1000; // 0ms, 1s, 2s
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Recursively retry with decremented retry count
      return sendWebhook(webhookUrl, payload, dryRun, retries - 1);
    }

    // No retries left or non-retriable error
    console.error(`Failed to send webhook: ${message}`, {
      webhookUrl,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });

    throw new Error(`Failed to send webhook: ${message}`, { cause: error });
  }

  return {
    sentTo: webhookUrl,
    payload,
    responseStatus: response?.status,
    responseData: response?.data,
    dryRun,
  };
}

/**
 * Determines if an error is worth retrying
 * Similar to isAuthError in ensemble.js, but for webhook-relevant errors
 */
function isRetriableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false; // Only retry HTTP errors
  }

  const status = error.response?.status;

  // Retry on:
  // - 5xx server errors (proxy is temporarily down)
  // - Network timeouts (ETIMEDOUT, ECONNABORTED)
  // - Connection refused (ECONNREFUSED)
  return (
    (status !== undefined && status >= 500) ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ECONNREFUSED'
  );
}
