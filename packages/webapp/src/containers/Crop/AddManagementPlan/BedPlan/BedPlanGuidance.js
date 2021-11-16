import PurePlanGuidance from '../../../../components/Crop/BedPlan/PurePlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useMemo } from 'react';
import { getBedGuidancePaths } from '../../../../components/Crop/getAddManagementPlanPath';

export default function BedPlan({ history, match }) {
  const variety_id = match.params.variety_id;
  const system = useSelector(measurementSelector);
  const isFinalPage = match?.path === '/crop/:variety_id/add_management_plan/bed_guidance';
  const { goBackPath, submitPath, cancelPath } = useMemo(
    () => getBedGuidancePaths(variety_id, isFinalPage),
    [],
  );
  return (
    <HookFormPersistProvider>
      <PurePlanGuidance
        system={system}
        history={history}
        isBed={true}
        variety_id={variety_id}
        isFinalPage={isFinalPage}
        goBackPath={goBackPath}
        submitPath={submitPath}
        cancelPath={cancelPath}
      />
    </HookFormPersistProvider>
  );
}
