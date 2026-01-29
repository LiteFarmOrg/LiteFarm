import { useSelector } from 'react-redux';
import { isOfflineSelector } from './offlineDetectorSlice';

export function useIsOffline() {
  return useSelector(isOfflineSelector);
}
