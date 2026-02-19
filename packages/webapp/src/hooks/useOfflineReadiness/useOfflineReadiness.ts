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
import {
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
 * Checks the cache status via the Service Worker or directly on window.caches (if no active controller) to determine offline readiness.
 * @returns Promise<CacheValidation> - The cache validation result.
 */
async function checkCacheStatus(): Promise<CacheValidation> {
  if (!navigator.serviceWorker?.controller) {
    // No active controller yet (SW still installing/activating)
    if (window.caches) {
      try {
        const cacheKeys = await window.caches.keys();
        const precacheName = cacheKeys.find((key) => key.includes('workbox-precache'));
        if (precacheName) {
          const cache = await window.caches.open(precacheName);
          const cachedKeys = await cache.keys();
          const totalCached = cachedKeys.length;
          if (totalCached > 0) {
            // Cache is present but SW hasn't claimed the page -- treat as in-progress
            return { isComplete: false, totalCached };
          }
        }
      } catch {
        // caches API not available or failed
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

export function useOfflineReadiness(): UseOfflineReadinessResult {
  const dispatch = useDispatch();
  const offline = useIsOffline();
  const { wentOfflineDuringSetup, cacheValidation, recoveryMode } =
    useSelector(offlineReadinessSelector);
  const isReadyForOffline = !!cacheValidation?.isComplete;

  // This check will not exclude localhost:3000, but will exclude browsers without SW support or other unsecured contexts
  // (e.g. hosted over the local network)
  const isServiceWorkerSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  console.log('useOfflineReadiness state:', {
    offline,
    isReadyForOffline,
    wentOfflineDuringSetup,
    cacheValidation,
    isServiceWorkerSupported,
    recoveryMode,
  });

  // Central validator run on startup, controllerchange, and offline/online transitions
  const validateAndUpdateState = async () => {
    const controlled = !!navigator.serviceWorker?.controller;

    const validation = await checkCacheStatus();
    dispatch(setCacheValidation(validation));

    if (validation.isComplete) {
      dispatch(setWentOfflineDuringSetup(false));
      dispatch(setRecoveryMode(false));
    } else if (controlled) {
      // SW is active (install phase complete), but cache is incomplete.
      // This is unrecoverable regardless of how many entries are cached
      dispatch(setRecoveryMode(true));
      dispatch(setWentOfflineDuringSetup(true));
    } else if (validation.totalCached && validation.totalCached > 0) {
      // No controller yet -- SW is still installing and actively filling the cache.
      // Not broken, just in progress
      dispatch(setRecoveryMode(false));
    }
    return validation;
  };

  // Clear setup-interrupted state on page load
  useLayoutEffect(() => {
    dispatch(setWentOfflineDuringSetup(false));
  }, []);

  useEffect(() => {
    const checkInitialState = async () => {
      if (!navigator.serviceWorker) return;

      try {
        await navigator.serviceWorker.ready;
        const controlled = !!navigator.serviceWorker.controller;

        // Validate cache on mount if we have a controller
        if (controlled) {
          await validateAndUpdateState();
        }
      } catch (e) {
        // Service worker not available or failed
      }
    };

    // Revalidate cache on controller change (new SW taking control)
    const handleControllerChange = () => {
      validateAndUpdateState();
    };

    if (navigator.serviceWorker) {
      checkInitialState();
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Handle offline/online transitions
  useEffect(() => {
    if (offline && !isReadyForOffline && isServiceWorkerSupported) {
      dispatch(setWentOfflineDuringSetup(true));
    }
    if (offline || (wentOfflineDuringSetup && !isReadyForOffline)) {
      validateAndUpdateState();
    }
  }, [offline]);

  const reloadApp = () => {
    window.location.reload();
  };

  const resetApplication = async () => {
    console.log('resetApplication: unregistering SWs...');
    if (navigator.serviceWorker) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
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
