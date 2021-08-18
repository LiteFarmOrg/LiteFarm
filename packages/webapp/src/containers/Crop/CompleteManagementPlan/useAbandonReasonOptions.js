import { useSelector } from 'react-redux';
import { managementPlansSelector } from '../../managementPlanSlice';
import { useMemo } from 'react';

export function useAbandonReasonOptions() {
  const managementPlans = useSelector(managementPlansSelector);
  return useMemo(() => {
    const reasonsSet = new Set(managementPlans.map(({ abandon_reason }) => abandon_reason));
    return Array.from(reasonsSet.values(), (reason) => ({ label: reason, value: reason }));
  }, [managementPlans]);
}
