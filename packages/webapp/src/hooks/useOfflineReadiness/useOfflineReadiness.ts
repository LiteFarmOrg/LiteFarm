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
  setControlled,
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
  isControlled: boolean;
  isServiceWorkerSupported: boolean;
  showReloadToResume: boolean;
  showWarning: boolean;
  showReset: boolean;
  isIndicatorOpen: boolean;
  reloadApp: () => void;
  resetApplication: () => Promise<void>;
}

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
 * Event flow (single source):
 * - main.jsx dispatches OFFLINE_READY_EVENT from registerSW(onOfflineReady)
 * - this hook listens for OFFLINE_READY_EVENT and validates cache integrity
 * - this hook also validates on startup (if controlled) and when going offline
 * - UI reads derived flags from this state (warning, reload prompt, reset)
 */
export function useOfflineReadiness(): UseOfflineReadinessResult {
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

  // Central validator used by all entry points (startup, offlineReady event, offline transition)
  const validateAndUpdateState = async () => {
    const controlled = !!navigator.serviceWorker?.controller;
    dispatch(setControlled(controlled));

    const validation = await checkCacheStatus();
    dispatch(setCacheValidation(validation));

    if (validation.isComplete) {
      dispatch(setOfflineReady(true));
      dispatch(setWentOfflineDuringSetup(false));
      dispatch(setRecoveryMode(false));
    } else {
      // Unrecoverable: active SW + empty cache means cache was dropped.
      if (validation.error === 'Cache is empty' && !offline && controlled) {
        dispatch(setRecoveryMode(true));
      }
      // Mark as interrupted setup if we are offline OR have a critical error (e.g. no controller).
      // If we are online and just incomplete (normal downloading), don't flag as interrupted.
      else if (offline || validation.error) {
        dispatch(setWentOfflineDuringSetup(true));
      }
    }
    return validation;
  };

  // Clear stale setup-interrupted state before first paint on fresh page load.
  // This avoids a one-frame flash of the reconnect prompt after reload.
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
        dispatch(setControlled(!!navigator.serviceWorker.controller));

        // Validate cache on mount if we have a controller
        if (navigator.serviceWorker.controller) {
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

  // Flag setup interruption if connection drops before offline-ready state.
  useEffect(() => {
    if (offline && !isReadyForOffline && isServiceWorkerSupported) {
      dispatch(setWentOfflineDuringSetup(true));
    }
  }, [offline, isReadyForOffline, isServiceWorkerSupported]);

  // Re-validate on offline transition to detect missing/corrupt precache.
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

  const showReloadToResume =
    isServiceWorkerSupported && !offline && wentOfflineDuringSetup && !isReadyForOffline;
  const showWarning = offline && !isReadyForOffline && isServiceWorkerSupported;
  const showReset = showReloadToResume && recoveryMode;
  const isIndicatorOpen = offline || showReloadToResume;

  const reloadApp = () => {
    window.location.reload();
  };

  const resetApplication = async () => {
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
    isControlled,
    isServiceWorkerSupported,
    showReloadToResume,
    showWarning,
    showReset,
    isIndicatorOpen,
    reloadApp,
    resetApplication,
  };
}
