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

import {
  cleanupOutdatedCaches,
  precacheAndRoute,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { Queue } from 'workbox-background-sync';
import { clientsClaim, cacheNames } from 'workbox-core';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

self.skipWaiting();
clientsClaim();

// Precache all the assets injected by VitePWA
// https://vite-pwa-org.netlify.app/guide/inject-manifest.html#service-worker-code
const precacheManifest = self.__WB_MANIFEST || [];
precacheAndRoute(precacheManifest);

cleanupOutdatedCaches();

/**
 * Validates that the cache has the expected number of entries.
 * Returns an object with validation results.
 */
async function validatePrecacheIntegrity() {
  try {
    const cacheName = cacheNames.precache || 'workbox-precache-v2';
    const cache = await caches.open(cacheName);
    const cachedKeys = await cache.keys();
    return { isComplete: cachedKeys.length >= precacheManifest.length };
  } catch {
    return { isComplete: false };
  }
}

// SPA navigation handler
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));
registerRoute(
  // Match /locales/{not-en}/anything.json
  /\/locales\/(?!en\/).*\.json$/,
  new NetworkFirst({
    cacheName: 'i18next-translations',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
      }),
    ],
  }),
);

/*
 * Higher-order function for onSync callbacks.
 * Replays requests and sends per-item success/failure messages to clients.
 */
const createOnSyncHandler = () => {
  return async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        const response = await fetch(entry.request.clone());

        let responseContent = null;
        try {
          responseContent = await response.clone().json();
        } catch {
          // Fallback to text if JSON parsing fails
          try {
            responseContent = await response.clone().text();
          } catch {
            // ignore
          }
        }

        // Not workbox-specific, but common to the service worker API: https://developer.mozilla.org/en-US/docs/Web/API/Clients/
        const successClients = await self.clients.matchAll();
        successClients.forEach((client) =>
          client.postMessage({
            type: 'SYNC_ITEM_SUCCESS',
            payload: {
              url: entry.request.url,
              method: entry.request.method,
              status: response.status,
              response: responseContent,
              queuedAt: entry.metadata.timestamp,
              auth: entry.request.headers.get('Authorization'),
              farm_id: entry.request.headers.get('farm_id'),
            },
          }),
        );
      } catch (error) {
        await queue.unshiftRequest(entry);

        const failureClients = await self.clients.matchAll();
        failureClients.forEach((client) =>
          client.postMessage({
            type: 'SYNC_ITEM_FAILURE',
            payload: {
              url: entry.request.url,
              method: entry.request.method,
              error: error.message,
            },
          }),
        );

        throw new Error(`Queue replay failed for ${queue.name}`);
      }
    }
  };
};

const RETRY_ROUTES = [
  {
    matcher: ({ url }) => url.pathname.includes('/task/'),
    method: 'POST',
  },
  {
    // This matcher as written will include task/patch_due_date, task/assign, task/abandon, etc.
    matcher: ({ url }) => url.pathname.includes('/task/'),
    method: 'PATCH',
  },
  {
    matcher: ({ url }) => url.pathname.includes('/task/'),
    method: 'DELETE',
  },
];

const RETRY_QUEUE_NAME = 'retry-requests';

const retryQueue = new Queue(RETRY_QUEUE_NAME, {
  maxRetentionTime: 24 * 60, // 24 hours
  // onSync is a no-op; the actual handler is createOnSyncHandler called from the message event listener below
  onSync: () => ({}),
});

// Store queue references globally to allow manual replay
const queues = {
  [RETRY_QUEUE_NAME]: { queue: retryQueue },
};

RETRY_ROUTES.forEach(({ matcher, method }) => {
  // Push to our queue on failure
  const queueOnFailurePlugin = {
    fetchDidFail: async ({ request }) => {
      await retryQueue.pushRequest({
        request,
        metadata: {
          timestamp: Date.now(),
        },
      });
    },
  };

  registerRoute(matcher, new NetworkOnly({ plugins: [queueOnFailurePlugin] }), method);
});

// ——————————————————————————————
self.addEventListener('message', async (event) => {
  if (event.data === 'check_cache_status') {
    const validation = await validatePrecacheIntegrity();
    event.ports[0].postMessage(validation);
    return;
  }

  if (event.data === 'replay_queue') {
    for (let { queue } of Object.values(queues)) {
      const handler = createOnSyncHandler();
      try {
        await handler({ queue });
      } catch (err) {
        // Ignore errors during manual replay; they are logged by the handler anyway
      }
    }
  }

  if (event.data === 'clear_queue') {
    for (const { queue } of Object.values(queues)) {
      while (await queue.shiftRequest()) {
        // Keep removing until shiftRequest returns undefined
      }
    }
  }
});
