/* eslint-disable no-undef */
// ===== Workbox imports =====
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import {
  NetworkOnly,
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

self.skipWaiting();
clientsClaim();

// ===== Precache Next assets =====
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// ===== Static assets =====
registerRoute(
  ({ request }) =>
    request.destination === 'style' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    matchOptions: { ignoreSearch: true },
  })
);

// ===== API: GET /api/leaderboard -> SWR (offline-friendly) =====
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' && url.pathname.startsWith('/api/leaderboard'),
  new StaleWhileRevalidate({
    cacheName: 'api-leaderboard',
  })
);

// ===== API: POST /api/trophies -> Background Sync queue =====
const trophiesQueue = new BackgroundSyncPlugin('trophiesQueue', {
  maxRetentionTime: 24 * 60, // menit (24 jam)
});
registerRoute(
  ({ url, request }) =>
    request.method === 'POST' && url.pathname.startsWith('/api/trophies'),
  new NetworkOnly({ plugins: [trophiesQueue] }),
  'POST'
);

// Navigation fallback -> /offline when offline
setCatchHandler(async ({ event }) => {
  if (event.request.mode === 'navigate') {
    const cached = await caches.match('/offline');
    if (cached) return cached;
  }
  return Response.error();
});
