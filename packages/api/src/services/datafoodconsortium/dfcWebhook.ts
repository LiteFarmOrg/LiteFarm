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
 * Terminology note: The DFC spec uses "proxy" - we use "partner" in our domain model and so will keep that here, but both refer to the same thing.
 *
 *
 * Our implementation will be simplified for MVP1:
 * - Single event type (refresh)
 * - Single scope (ReadEnterprise)
 * - enterpriseUrlid always points to our enterprises endpoint
 *
 * (Simplification reference is the OFN-QCCM implementation)
 */

/**
 * Event types per DFC Data Server Development Guide
 */
export enum WebhookEventType {
  REFRESH = 'refresh',
}

/* Scopes per DFC Data Server Development Guide */
export enum Scope {
  READ_ENTERPRISE = 'ReadEnterprise',
}

/**
 * URL for all refresh webhook notifications
 */
const REFRESH_ENTERPRISES_URL = createEnterpriseUrl('');

interface RefreshWebhookPayload {
  eventType: WebhookEventType.REFRESH;
  enterpriseUrlid: string;
  scope: Scope.READ_ENTERPRISE;
}

/**
 * Sends a 'refresh' notification to partner
 * Call when permissions are added or updated, and when directory data changes
 */
export async function notifyPartnerRefresh(
  webhookUrl: string,
  dryRun = false,
): Promise<WebhookResult> {
  return sendWebhook(
    webhookUrl,
    {
      eventType: WebhookEventType.REFRESH,
      enterpriseUrlid: REFRESH_ENTERPRISES_URL,
      scope: Scope.READ_ENTERPRISE,
    },
    dryRun,
  );
}

type WebhookPayload = RefreshWebhookPayload;

/**
 * Sends to partner's webhook with authentication
 *
 * @throws {Error} If webhook URL is missing or request fails
 */
interface WebhookResult {
  sentTo: string;
  payload: WebhookPayload;
  responseStatus?: number;
  responseData?: unknown;
  dryRun?: boolean;
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
    const details = {
      sentTo: webhookUrl,
      payload,
      dryRun,
    };
    console.log(details);
    return details;
  }

  try {
    // Get access token from Keycloak
    const accessToken = await getAccessToken();

    // Send webhook notification with token authorization
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // wait up to 10 seconds for the webhook to respond
    });

    console.log('Webhook sent successfully:', {
      eventType: payload.eventType,
      timestamp: new Date().toISOString(),
      webhookUrl,
    });

    return {
      sentTo: webhookUrl,
      payload,
      responseStatus: response?.status,
      responseData: response?.data,
    };
  } catch (error) {
    const message =
      axios.isAxiosError(error) || error instanceof Error ? error.message : 'Unknown error';

    if (retries > 0 && isServerOrNetworkError(error)) {
      console.warn(`Webhook failed, retrying... ${retries} attempts remaining`, {
        webhookUrl,
        error: message,
      });

      // Wait before retrying
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
}

/**
 * Determines if an error is a server-side or network error that should be retried
 * Similar to isAuthError in ensemble.js, but for webhook-relevant errors
 */
function isServerOrNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false; // only retry axios errors
  }

  const status = error.response?.status;

  // Retry on:
  // - 5xx server errors (webhook is temporarily down)
  // - Network timeouts (ETIMEDOUT, ECONNABORTED)
  // - Connection refused (ECONNREFUSED)
  return (
    (status !== undefined && status >= 500) ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ECONNREFUSED'
  );
}
