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

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OFFLINE_READY_EVENT } from '../../pwa/offlineReadyEvent';
import {
  setOfflineReady,
  setWentOfflineDuringSetup,
  setCacheValidation,
  setControlled,
  offlineReadinessSelector,
  type CacheValidation,
} from './offlineReadinessSlice';
import { useIsOffline } from '../../containers/hooks/useOfflineDetector/useIsOffline';

/**
 * Checks the cache status via the Service Worker.
 * @returns Promise<CacheValidation> - The cache validation result.
 */
async function checkCacheStatus(): Promise<CacheValidation> {
  if (!navigator.serviceWorker?.controller) {
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
 * @returns {object} Offline readiness state and supporting status flags.
 */
export function useOfflineReadiness() {
  const dispatch = useDispatch();
  const offline = useIsOffline();
  const { isReadyForOffline, wentOfflineDuringSetup, cacheValidation, isControlled } =
    useSelector(offlineReadinessSelector);

  // TODO: fix this check; doesn't actually exclude localhost:3000 as intended
  const isServiceWorkerSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  console.log('useOfflineReadiness state:', {
    offline,
    isReadyForOffline,
    wentOfflineDuringSetup,
    cacheValidation,
    isControlled,
    isServiceWorkerSupported,
  });

  // Reset "wentOfflineDuringSetup" flag on mount.
  // This ensures that if the user reloads the page (to "try again"),
  // they don't see the stale error message from the previous session.
  useEffect(() => {
    dispatch(setWentOfflineDuringSetup(false));
  }, []);

  useEffect(() => {
    const handleOfflineReady = async () => {
      console.log('Received offline ready event, validating cache...');
      // Validate cache contents when we receive the offline ready event
      const validation = await checkCacheStatus();
      dispatch(setCacheValidation(validation));

      if (validation.isComplete) {
        dispatch(setOfflineReady(true));
        // Clear the flag since we're now ready
        dispatch(setWentOfflineDuringSetup(false));
      }
    };

    const handleControllerChange = () => {
      console.log('Service worker controller changed, re-checking control status...');
      const controlled = !!navigator.serviceWorker?.controller;
      dispatch(setControlled(controlled));
    };

    // Listen for the custom offline ready event from registerSW
    window.addEventListener(OFFLINE_READY_EVENT, handleOfflineReady);

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // Check initial state
      navigator.serviceWorker.ready
        .then(async () => {
          dispatch(setControlled(!!navigator.serviceWorker.controller));

          // Validate cache on mount if we have a controller
          if (navigator.serviceWorker.controller) {
            const validation = await checkCacheStatus();
            dispatch(setCacheValidation(validation));

            if (validation.isComplete) {
              dispatch(setOfflineReady(true));
              // Clear the flag since we're now ready
              dispatch(setWentOfflineDuringSetup(false));
            }
          }
        })
        .catch(() => {
          // Service worker not available or failed
        });
    }

    return () => {
      window.removeEventListener(OFFLINE_READY_EVENT, handleOfflineReady);

      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
  }, []);

  // Track when user goes offline during setup
  // We track this if the client supports SW, even if not yet controlled.
  // This ensures we catch connection drops during the initial install phase.
  useEffect(() => {
    if (offline && !isReadyForOffline && isServiceWorkerSupported) {
      dispatch(setWentOfflineDuringSetup(true));
    }
  }, [offline, isReadyForOffline, isServiceWorkerSupported]);

  // Re-validate cache when going offline.
  // This detects cases where the cache was manually deleted or corrupted while the app was running.
  useEffect(() => {
    if (offline) {
      checkCacheStatus().then((validation) => {
        dispatch(setCacheValidation(validation));
        if (!validation.isComplete) {
          // If cache is missing/incomplete, mark strictly as not ready
          dispatch(setOfflineReady(false));
          // Since we are offline and not ready, this counts as "offline during setup"
          dispatch(setWentOfflineDuringSetup(true));
        } else {
          dispatch(setOfflineReady(true));
          dispatch(setWentOfflineDuringSetup(false));
        }
      });
    }
  }, [offline]);

  return {
    isReadyForOffline,
    wentOfflineDuringSetup,
    cacheValidation,
    isControlled,
    isServiceWorkerSupported,
  };
}
