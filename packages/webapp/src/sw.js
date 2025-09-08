import {
  cleanupOutdatedCaches,
  precacheAndRoute,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';
import { WorkboxError } from 'workbox-core/_private/WorkboxError.js';

// 1. Immediately take control of the page
self.skipWaiting();
clientsClaim();

// 2. Precache all the assets injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST);

// 3. Clean up old caches
cleanupOutdatedCaches();

// 4. A sensible default for SPA navigation
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

// ——————————————————————————————
// Helper: produces an onSync callback that:
//  • replays each queued request exactly as Workbox does
//  *** see https://github.com/GoogleChrome/workbox/blob/v7/packages/workbox-background-sync/src/Queue.ts
//  • sends per-item success/failure messages, plus a “queue empty” at the end
//  • tags each message with the given `area` so you can distinguish endpoints
// ——————————————————————————————
const createOnSyncHandler = (area) => {
  return async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        // replay the request just like workbox-default
        await fetch(entry.request.clone());

        // notify clients of success for this URL
        const successClients = await self.clients.matchAll();
        successClients.forEach((client) =>
          client.postMessage({
            type: 'SYNC_ITEM_SUCCESS',
            payload: { area, url: entry.request.url },
          }),
        );
      } catch (error) {
        // put it back at front so Workbox will retry later
        await queue.unshiftRequest(entry);

        // notify clients of failure for this URL
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

        // re-throw exactly like Workbox does so it re-registers the sync
        throw new WorkboxError('queue-replay-failed', { name: queue.name });
      }
    }

    // queue is now empty
    const doneClients = await self.clients.matchAll();
    doneClients.forEach((client) =>
      client.postMessage({
        type: 'SYNC_QUEUE_EMPTY',
        payload: { area },
      }),
    );
  };
};

// ——————————————————————————————
// Configuration for all background-sync routes.
// To add PATCH /task/ or DELETE /task/ later, just add a new entry here.
// ——————————————————————————————
const BG_SYNC_ROUTES = [
  {
    queueName: 'create-task-queue',
    matcher: ({ url, request }) => url.pathname.includes('/task/') && request.method === 'POST',
    area: 'tasks.create',
    method: 'POST',
  },
  // Example future entries:
  // {
  //   queueName: 'patch-task-queue',
  //   matcher: ({ url, request }) =>
  //     url.pathname.includes('/task/') && request.method === 'PATCH',
  //   area: 'tasks.update',
  //   method: 'PATCH',
  // },
  // {
  //   queueName: 'delete-task-queue',
  //   matcher: ({ url, request }) =>
  //     url.pathname.includes('/task/') && request.method === 'DELETE',
  //   area: 'tasks.delete',
  //   method: 'DELETE',
  // },
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
