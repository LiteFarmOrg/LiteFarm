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

/**
 * Event types as specified in the  Data Server Development Guide
 */
export const WEBHOOK_EVENT_TYPES = {
  UPDATE: 'update',
  REVOKE: 'revoke',
  REFRESH: 'refresh',
} as const;

/**
 * Payload for 'update' events - sends the full serialized object
 */
interface UpdateWebhookPayload {
  eventType: 'update';
  data: unknown; // The DFC-serialized farm/enterprise data
}

/**
 * Payload for 'revoke' events - sends list of revoked resource IDs
 */
interface RevokeWebhookPayload {
  eventType: 'revoke';
  objects: Array<{
    '@id': string;
    '@type': string;
  }>;
}

/**
 * Payload for 'refresh' events - indicates scope permission change
 */
interface RefreshWebhookPayload {
  eventType: 'refresh';
  enterpriseUrlid: string; // The @id of the enterprise that granted/revoked data
}

type WebhookPayload = UpdateWebhookPayload | RevokeWebhookPayload | RefreshWebhookPayload;

/**
 * Sends a webhook notification to proxy server.
 * This is a non-blocking operation that should be called as a post-response side effect.
 *
 * Based on: https://git.startinblox.com/projets/projets-clients/open-food-network/data-permissioning-module/-/wikis/Data-Server-Development-Guide#implementing-webhooks-for-keeping-proxy-servers-up-to-date
 *
 * @param payload - The webhook payload based on event type
 * @returns Promise that resolves when webhook is successfully sent
 * @throws Error if webhook call fails (caller should handle with try-catch)
 */
export async function sendWebhook(webhookUrl: string, payload: WebhookPayload): Promise<void> {
  if (!webhookUrl) {
    throw new Error('Webhook URL not given');
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
}

/**
 * Helper function to send an 'update' webhook when farm data is created or updated
 */
export async function notifyFarmDataUpdate(webhookUrl: string, farmData: unknown): Promise<void> {
  return sendWebhook(webhookUrl, {
    eventType: WEBHOOK_EVENT_TYPES.UPDATE,
    data: farmData,
  });
}

/**
 * Helper function to send a 'revoke' webhook when permission is revoked or data is deleted
 */
export async function notifyFarmDataRevoke(
  webhookUrl: string,
  resourceId: string,
  resourceType: string,
): Promise<void> {
  return sendWebhook(webhookUrl, {
    eventType: WEBHOOK_EVENT_TYPES.REVOKE,
    objects: [
      {
        '@id': resourceId,
        '@type': resourceType,
      },
    ],
  });
}

/**
 * Helper function to send a 'refresh' webhook when scope permissions change
 */
export async function notifyScopeChange(webhookUrl: string, enterpriseId: string): Promise<void> {
  return sendWebhook(webhookUrl, {
    eventType: WEBHOOK_EVENT_TYPES.REFRESH,
    enterpriseUrlid: enterpriseId,
  });
}
