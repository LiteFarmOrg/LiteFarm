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

import { useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OFFLINE_READY_EVENT } from '../../pwa/offlineReadyEvent';
import {
  setOfflineReady,
  setWentOfflineDuringSetup,
  setCacheValidation,
  setRecoveryMode,
  offlineReadinessSelector,
  type CacheValidation,
} from './offlineReadinessSlice';
import { useIsOffline } from '../../containers/hooks/useOfflineDetector/useIsOffline';

export interface UseOfflineReadinessResult {
  isReadyForOffline: boolean;
  wentOfflineDuringSetup: boolean;
  cacheValidation: CacheValidation | null;
  recoveryMode: boolean;
  isServiceWorkerSupported: boolean;
  reloadApp: () => void;
  resetApplication: () => Promise<void>;
}

/**
 * Checks the cache status via the Service Worker.
 * @returns Promise<CacheValidation> - The cache validation result.
 */
async function checkCacheStatus(): Promise<CacheValidation> {
  if (!navigator.serviceWorker?.controller) {
    // No active controller yet (SW still installing/activating), but cache storage is independent
    // of the SW lifecycle -- check it directly so we can report whether precaching has started.
    if (window.caches) {
      try {
        const cacheKeys = await window.caches.keys();
        const precacheName = cacheKeys.find((k) => k.includes('workbox-precache'));
        if (precacheName) {
          const cache = await window.caches.open(precacheName);
          const cachedKeys = await cache.keys();
          const totalCached = cachedKeys.length;
          if (totalCached > 0) {
            // Cache is downloading but SW hasn't claimed the page yet -- not ready, but not broken
            return { isComplete: false, totalCached };
          }
        }
      } catch {
        // caches API not available or failed; fall through to the generic error
      }
    }
    return { isComplete: false, error: 'No service worker controller' };
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data as CacheValidation);
    };

    navigator.serviceWorker.controller!.postMessage('check_cache_status', [messageChannel.port2]);
  });
}

/**
 * Hook to determine if the App is ready for offline usage.
 *
 * 'Ready for offline' means that:
 * 1. A Service Worker has completed its installation and precaching
 * 2. The SW has taken control of the page
 * 3. All expected assets are present in the cache (validated)
 *
 * Event flow (single source):
 * - main.jsx dispatches OFFLINE_READY_EVENT from registerSW(onOfflineReady)
 * - this hook listens for OFFLINE_READY_EVENT and validates cache integrity
 * - this hook also validates on startup (if controlled) and when going offline
 * - UI reads derived flags from this state (warning, reload prompt, reset)
 */
export function useOfflineReadiness(): UseOfflineReadinessResult {
  const dispatch = useDispatch();
  const offline = useIsOffline();
  const { isReadyForOffline, wentOfflineDuringSetup, cacheValidation, recoveryMode } =
    useSelector(offlineReadinessSelector);

  // TODO: fix this check; doesn't actually exclude localhost:3000 as intended
  const isServiceWorkerSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  console.log('useOfflineReadiness state:', {
    offline,
    isReadyForOffline,
    wentOfflineDuringSetup,
    cacheValidation,
    isServiceWorkerSupported,
    recoveryMode,
  });

  // Central validator used by all entry points (startup, offlineReady event, offline transition)
  const validateAndUpdateState = async () => {
    const controlled = !!navigator.serviceWorker?.controller;
    console.log('validateAndUpdateState: controlled =', controlled);

    const validation = await checkCacheStatus();
    console.log('validateAndUpdateState: validation =', validation);
    dispatch(setCacheValidation(validation));

    if (validation.isComplete) {
      dispatch(setOfflineReady(true));
      dispatch(setWentOfflineDuringSetup(false));
      dispatch(setRecoveryMode(false));
    } else if (controlled) {
      // SW is active (install phase complete via skipWaiting+clientsClaim), but cache is
      // incomplete. This is unrecoverable regardless of how many entries are cached:
      // 0 entries = cache was dropped; >0 entries = cache got stuck mid-install.
      // Crucially we don't guard on !offline here -- setting recoveryMode while offline
      // means coming back online immediately shows Reset, not Reload (no flash).
      dispatch(setRecoveryMode(true));
    } else if (validation.totalCached && validation.totalCached > 0) {
      // No controller yet -- SW is still installing and actively filling the cache.
      // Not broken, just in progress. Clear any stale recovery mode.
      dispatch(setRecoveryMode(false));
    } else if (offline) {
      // No controller, empty cache, offline -- interrupted very early in install.
      dispatch(setWentOfflineDuringSetup(true));
    }
    return validation;
  };

  // Clear stale setup-interrupted state before first paint on fresh page load.
  // This avoids a one-frame flash of the reconnect prompt after reload.
  // Note: recoveryMode is NOT cleared here -- it must be cleared by validation
  // (either finding a complete cache or finding no controller with a partial cache).
  useLayoutEffect(() => {
    dispatch(setWentOfflineDuringSetup(false));
  }, []);

  useEffect(() => {
    const handleOfflineReady = async () => {
      console.log('Received offline ready event, validating cache...');

      // Retry logic: wait for controller to be available
      let attempts = 0;
      while (!navigator.serviceWorker?.controller && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        attempts++;
      }

      await validateAndUpdateState();
    };

    const checkInitialState = async () => {
      if (!navigator.serviceWorker) return;

      try {
        await navigator.serviceWorker.ready;
        const controlled = !!navigator.serviceWorker.controller;
        console.log('checkInitialState: controlled =', controlled);

        // Validate cache on mount if we have a controller
        if (controlled) {
          await validateAndUpdateState();
        }
      } catch (e) {
        // Service worker not available or failed
      }
    };

    // Listen for app-level signal emitted from registerSW(onOfflineReady).
    window.addEventListener(OFFLINE_READY_EVENT, handleOfflineReady);

    if (navigator.serviceWorker) {
      checkInitialState();
    }

    return () => {
      window.removeEventListener(OFFLINE_READY_EVENT, handleOfflineReady);
    };
  }, []);

  // Handle offline/online transitions: flag interrupted setup, validate cache
  useEffect(() => {
    if (offline) {
      // Going offline: flag setup interruption if not ready
      if (!isReadyForOffline && isServiceWorkerSupported) {
        console.log('Went offline before ready, flagging interrupted setup');
        dispatch(setWentOfflineDuringSetup(true));
      }

      // Validate to detect missing/corrupt precache
      console.log('Went offline, validating cache status...');
      const validate = async () => {
        const validation = await validateAndUpdateState();
        if (!validation.isComplete) {
          dispatch(setOfflineReady(false));
          dispatch(setWentOfflineDuringSetup(true));
        }
      };
      validate();
    } else if (wentOfflineDuringSetup && !isReadyForOffline && isServiceWorkerSupported) {
      // Coming back online after interrupted setup: re-validate to detect recoverable vs unrecoverable state
      console.log('Back online after interrupted setup, re-validating cache...');
      validateAndUpdateState();
    }
  }, [offline]);

  const reloadApp = () => {
    window.location.reload();
  };

  const resetApplication = async () => {
    console.log('resetApplication: unregistering SWs and clearing caches...');
    if (navigator.serviceWorker) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    if (window.caches) {
      const keys = await window.caches.keys();
      for (const key of keys) {
        await window.caches.delete(key);
      }
    }
    window.location.reload();
  };

  return {
    isReadyForOffline,
    wentOfflineDuringSetup,
    cacheValidation,
    recoveryMode,
    isServiceWorkerSupported,
    reloadApp,
    resetApplication,
  };
}
