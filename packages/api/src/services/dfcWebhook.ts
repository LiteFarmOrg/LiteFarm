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
import { getAccessToken } from './keycloak.js';
import { createEnterpriseUrl } from './dfcAdapter.js';

/* This module is based on the Data Server Development Guide on GitLab:
https://git.startinblox.com/projets/projets-clients/open-food-network/data-permissioning-module/-/wikis/Data-Server-Development-Guide

However we will not follow it exactly, but will use OFN-CQCM's implementation as a reference:
https://github.com/openfoodfoundation/openfoodnetwork/blob/master/spec/fixtures/vcr_cassettes/ProxyNotifier/notifies_the_proxy.yml

This means we'll use only one eventType (refresh) and one URL
*/

/**
 * Event types as specified in the  Data Server Development Guide
 */
export enum WEBHOOK_EVENT_TYPES {
  REFRESH = 'refresh',
}

/* Scopes as specified in the Data Server Development Guide */
export enum SCOPES {
  READ_ENTERPRISE = 'ReadEnterprise',
}

/**
 * Refresh webhooks always provide our base enterprises URL
 */
const REFRESH_ENTERPRISES_URL = createEnterpriseUrl('');

interface RefreshWebhookPayload {
  eventType: WEBHOOK_EVENT_TYPES.REFRESH;
  enterpriseUrlid: string;
  scope: SCOPES.READ_ENTERPRISE;
}

type WebhookPayload = RefreshWebhookPayload; // Extendable for future event types
/**
 * Sends a webhook notification to proxy server.
 * This is a non-blocking operation that should be called as a post-response side effect.
 *
 * See: https://git.startinblox.com/projets/projets-clients/open-food-network/data-permissioning-module/-/wikis/Data-Server-Development-Guide#implementing-webhooks-for-keeping-proxy-servers-up-to-date
 *
 * @param payload - The webhook payload based on event type
 * @returns Promise that resolves when webhook is successfully sent
 * @throws Error if webhook call fails (caller should handle with try-catch)
 */
export async function sendWebhook(
  webhookUrl: string,
  payload: WebhookPayload,
  dryRun = false,
): Promise<WebhookPayload> {
  if (!webhookUrl) {
    throw new Error('Webhook URL not given');
  }

  if (dryRun) {
    return payload;
  }

  try {
    // Step 1: Get access token from Keycloak
    const accessToken = await getAccessToken();

    // Step 2: Call the webhook with authentication
    await axios.post(
      webhookUrl, // e.g., 'https://ofn.example.com/djangoldp-dfc/webhook/'
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout for webhook calls
      },
    );

    console.log('Webhook sent successfully:', {
      eventType: payload.eventType,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to send Webhook:', {
        eventType: payload.eventType,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('Failed to send Webhook:', error);
    }
    throw error; // Re-throw so caller can decide how to handle
  }
  return payload;
}
/**
 * Helper function to send a 'refresh' webhook when scope permissions change. We will use this webhook in all cases when permission is granted or revoked, and when farm data is updated
 */
export async function notifyProxyRefresh(
  webhookUrl: string,
  dryRun = false,
): Promise<RefreshWebhookPayload> {
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
