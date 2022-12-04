import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateOfflineStatus } from './offlineDetectorSlice';

/**
 * {@link enqueueErrorSnackbar} If offline, all error snackbar will be disabled
 */
export function OfflineDetector() {
  const dispatch = useDispatch();
  const goOnline = () => dispatch(updateOfflineStatus(false));
  const goOffline = () => dispatch(updateOfflineStatus(true));
  useEffect(() => {
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);
}
