import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateOfflineStatus, serviceWorkerMessageReceived } from './offlineDetectorSlice';

/**
 * {@link enqueueErrorSnackbar} If offline, all error snackbar will be disabled
 */
export function OfflineDetector() {
  const dispatch = useDispatch();
  const goOnline = () => dispatch(updateOfflineStatus(false));
  const goOffline = () => dispatch(updateOfflineStatus(true));
  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type) {
        dispatch(serviceWorkerMessageReceived(event.data));
      }
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);

      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);
}
