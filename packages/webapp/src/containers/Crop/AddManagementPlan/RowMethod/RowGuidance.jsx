import PurePlanGuidance from '../../../../components/Crop/BedPlan/PurePlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useMemo } from 'react';
import { getRowGuidancePaths } from '../../../../components/Crop/getAddManagementPlanPath';

export default function RowGuidance({ history, match, location }) {
  const variety_id = match.params.variety_id;
  const system = useSelector(measurementSelector);
  const isFinalPage = match?.path === '/crop/:variety_id/add_management_plan/row_guidance';
  const { submitPath } = useMemo(() => getRowGuidancePaths(variety_id, isFinalPage), []);
  return (
    <HookFormPersistProvider>
      <PurePlanGuidance
        system={system}
        history={history}
        isBed={false}
        isFinalPage={isFinalPage}
        variety_id={variety_id}
        submitPath={submitPath}
        location={location}
      />
    </HookFormPersistProvider>
  );
}
