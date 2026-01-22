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
import { NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';

// 1. Immediately take control of the page
self.skipWaiting();
clientsClaim();

// 2. Precache all the assets injected by VitePWA
// https://vite-pwa-org.netlify.app/guide/inject-manifest.html#service-worker-code
precacheAndRoute(self.__WB_MANIFEST);

// 3. Clean up old caches
cleanupOutdatedCaches();

// 4. A sensible default for SPA navigation
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

/* ——————————————————————————————
Higher-order function for onSync callbacks that:
• replay each queued request as Workbox does
• sends per-item success/failure messages
• passes the given area string to the message for context

Here is the workbox class for Queue:
// https://github.com/GoogleChrome/workbox/blob/main/packages/workbox-background-sync/src/Queue.ts
 —————————————————————————————— */
const createOnSyncHandler = (area) => {
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
              area,
              url: entry.request.url,
              status: response.status,
              response: responseContent,
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
              area,
              url: entry.request.url,
              error: error.message,
            },
          }),
        );

        throw new Error(`Queue replay failed for ${queue.name}`);
      }
    }
  };
};

// ——————————————————————————————
// Configuration for all background-sync routes.
// ——————————————————————————————
const BG_SYNC_ROUTES = [
  {
    queueName: 'create-task-queue',
    matcher: ({ url }) => url.pathname.includes('/task/'),
    area: 'tasks.create',
    method: 'POST',
  },
  {
    queueName: 'patch-task-queue',
    // This matcher as written will include task/patch_due_date, task/assign, task/abandon, etc.
    matcher: ({ url }) => url.pathname.includes('/task/'),
    area: 'tasks.update',
    method: 'PATCH',
  },
  {
    queueName: 'delete-task-queue',
    matcher: ({ url }) => url.pathname.includes('/task/'),
    area: 'tasks.delete',
    method: 'DELETE',
  },
];

// ——————————————————————————————
// Register each route with its own queueName + onSync handler
// ——————————————————————————————
BG_SYNC_ROUTES.forEach(({ queueName, matcher, area, method }) => {
  const plugin = new BackgroundSyncPlugin(queueName, {
    maxRetentionTime: 24 * 60, // 24 hours
    onSync: createOnSyncHandler(area),
  });

  registerRoute(matcher, new NetworkOnly({ plugins: [plugin] }), method);
});
