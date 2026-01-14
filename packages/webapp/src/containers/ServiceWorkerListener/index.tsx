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
import { useDispatch } from 'react-redux';
import { serviceWorkerMessageReceived } from './serviceWorkerSlice';

/**
 * Global listener for messages sent from the Service Worker (sw.js).
 * Handles background sync events, cache updates, etc.
 */
export function ServiceWorkerListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      // Ensure we only dispatch valid messages.
      // event.data is the payload sent from sw.js (e.g. { type: 'SYNC_ITEM_SUCCESS', payload: ... })
      if (event.data && event.data.type) {
        dispatch(serviceWorkerMessageReceived(event.data));
      }
    };

    const swContainer = navigator.serviceWorker;

    // It's possible for navigator.serviceWorker to be undefined in some environments (e.g. non-secure contexts or older browsers)
    if (swContainer) {
      swContainer.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if (swContainer) {
        swContainer.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [dispatch]);

  // This component renders nothing; it is purely for side effects.
  return null;
}
