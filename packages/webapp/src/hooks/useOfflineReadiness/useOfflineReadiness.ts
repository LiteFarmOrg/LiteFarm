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
  offlineReadinessSelector,
  type CacheValidation,
} from './offlineReadinessSlice';
import { useIsOffline } from '../../containers/hooks/useOfflineDetector/useIsOffline';
import { postEventLogs } from '../../util/offlineEventLogger';

export interface UseOfflineReadinessResult {
  isReadyForOffline: boolean;
  wentOfflineDuringSetup: boolean;
  isServiceWorkerSupported: boolean;
  restoreCache: () => void;
}

/**
 * Checks the cache status via the Service Worker to determine offline readiness.
 * @returns Promise<CacheValidation> - The cache validation result.
 */
async function checkCacheStatus(): Promise<CacheValidation> {
  const controlled = !!navigator.serviceWorker?.controller;

  if (!controlled) {
    // No active controller yet (SW still installing/activating) — not ready for offline
    return { isComplete: false, controlled };
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve({ ...(event.data as CacheValidation), controlled });
    };

    navigator.serviceWorker.controller!.postMessage('check_cache_status', [messageChannel.port2]);
  });
}

const reloadApp = () => {
  window.location.reload();
  postEventLogs({
    logs: [{ eventName: 'reload_app', eventAt: Date.now() }],
  });
};

const resetApplication = async () => {
  if (navigator.serviceWorker) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
  postEventLogs({
    logs: [{ eventName: 'reset_app', eventAt: Date.now() }],
  });
  window.location.reload();
};

export function useOfflineReadiness(): UseOfflineReadinessResult {
  const dispatch = useDispatch();
  const offline = useIsOffline();
  const { wentOfflineDuringSetup, cacheValidation } = useSelector(offlineReadinessSelector);
  const isReadyForOffline = !!cacheValidation?.isComplete;
  const recoveryMode =
    !!cacheValidation && !cacheValidation.isComplete && !!cacheValidation.controlled;

  // This check will not exclude localhost:3000, but will exclude browsers without SW support or other unsecured contexts
  // (e.g. hosted over the local network)
  const isServiceWorkerSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  const validateAndUpdateState = async () => {
    const validation = await checkCacheStatus();
    dispatch(setCacheValidation(validation));

    if (validation.isComplete) {
      dispatch(setWentOfflineDuringSetup(false));
    } else if (validation.controlled) {
      // SW is active (install phase complete), but cache is incomplete.
      // Note: This combination of state already sets recovery mode to true;
      // setWentOfflineDuringSetup is used for the UI element
      dispatch(setWentOfflineDuringSetup(true));
    }
  };

  // useLayoutEffect to prevent flash of refresh UI from persisted state
  useLayoutEffect(() => {
    dispatch(setWentOfflineDuringSetup(false));
  }, []);

  // Handle initial page load
  useEffect(() => {
    if (navigator.serviceWorker) {
      validateAndUpdateState();
      navigator.serviceWorker.addEventListener('controllerchange', validateAndUpdateState);
    }

    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', validateAndUpdateState);
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

  return {
    isReadyForOffline,
    wentOfflineDuringSetup,
    isServiceWorkerSupported,
    restoreCache: recoveryMode ? resetApplication : reloadApp,
  };
}
