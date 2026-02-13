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
  setRecoveryMode,
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
  const { isReadyForOffline, wentOfflineDuringSetup, cacheValidation, isControlled, recoveryMode } =
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
    recoveryMode,
  });

  // Helper to validate and update state
  const validateAndUpdateState = async () => {
    const validation = await checkCacheStatus();
    dispatch(setCacheValidation(validation));

    if (validation.isComplete) {
      dispatch(setOfflineReady(true));
      dispatch(setWentOfflineDuringSetup(false));
      dispatch(setRecoveryMode(false));
    } else {
      // Detect unrecoverable state: cache is completely empty despite having an active SW
      // This indicates the cache was dropped and won't regenerate without intervention
      if (validation.error === 'Cache is empty' && !offline && isControlled) {
        dispatch(setRecoveryMode(true));
      }
      // Mark as interrupted setup if we are offline OR have a critical error (e.g. no controller)
      // If we are online and just incomplete (normal downloading), don't flag as interrupted
      else if (offline || validation.error) {
        dispatch(setWentOfflineDuringSetup(true));
      }
    }
    return validation;
  };

  // Reset "wentOfflineDuringSetup" flag on mount.
  // This ensures that if the user reloads the page (to "try again"),
  // they don't see the stale error message from the previous session.
  useEffect(() => {
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

    const handleControllerChange = () => {
      console.log('Service worker controller changed, re-checking control status...');
      const controlled = !!navigator.serviceWorker?.controller;
      dispatch(setControlled(controlled));
    };

    const checkInitialState = async () => {
      if (!navigator.serviceWorker) return;

      try {
        await navigator.serviceWorker.ready;
        dispatch(setControlled(!!navigator.serviceWorker.controller));

        // Validate cache on mount if we have a controller
        if (navigator.serviceWorker.controller) {
          await validateAndUpdateState();
        }
      } catch (e) {
        // Service worker not available or failed
      }
    };

    // Listen for the custom offline ready event from registerSW
    window.addEventListener(OFFLINE_READY_EVENT, handleOfflineReady);

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      checkInitialState();
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
      console.log('Went offline, validating cache status...');
      const validate = async () => {
        const validation = await validateAndUpdateState();
        if (!validation.isComplete) {
          // If cache is missing/incomplete, mark strictly as not ready
          dispatch(setOfflineReady(false));
          // Since we are offline and not ready, this counts as "offline during setup"
          dispatch(setWentOfflineDuringSetup(true));
        }
      };
      validate();
    }
  }, [offline]);

  return {
    isReadyForOffline,
    wentOfflineDuringSetup,
    cacheValidation,
    recoveryMode,
    isControlled,
    isServiceWorkerSupported,
  };
}
