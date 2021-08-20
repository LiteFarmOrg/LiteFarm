import { useSelector } from 'react-redux';
import { managementPlansSelector } from '../../managementPlanSlice';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultAbandonManagementPlanReasonOptions } from '../../../components/Crop/CompleteManamgenentPlan/PureCompleteManagementPlan';

export function useAbandonReasonOptions() {
  const { t } = useTranslation();
  const managementPlans = useSelector(managementPlansSelector);
  return useMemo(() => {
    const reasonsSet = new Set(
      managementPlans
        .map(({ abandon_reason }) => abandon_reason)
        .filter(
          (abandon_reason) =>
            !defaultAbandonManagementPlanReasonOptions
              .map((option) => option.value)
              .includes(abandon_reason),
        ),
    );
    reasonsSet.delete(null);
    return Array.from(reasonsSet.values(), (reason) => {
      return { label: reason, value: reason };
    });
  }, [managementPlans]);
}
