import { useSelector } from 'react-redux';

export function useIsOffline() {
  return useSelector(
    (state: any) => state?.tempStateReducer?.offlineDetectorReducer.isOffline as boolean,
  );
}
