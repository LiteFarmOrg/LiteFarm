import PureBedPlan from '../../../../components/Crop/BedPlan/PureBedPlan';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { useMemo } from 'react';
import { getBedMethodPaths } from '../../../../components/Crop/getAddManagementPlanPath';

export default function BedPlan({ history, match }) {
  const system = useSelector(measurementSelector);
  const crop_variety = useSelector(cropVarietySelector(match.params.variety_id));
  const isFinalPage = match.path === '/crop/:variety_id/add_management_plan/bed_method';
  const { goBackPath, submitPath, cancelPath } = useMemo(
    () => getBedMethodPaths(crop_variety.crop_variety_id, isFinalPage),
    [],
  );
  return (
    <HookFormPersistProvider>
      <PureBedPlan
        match={match}
        history={history}
        system={system}
        crop_variety={crop_variety}
        isFinalPage={isFinalPage}
        goBackPath={goBackPath}
        submitPath={submitPath}
        cancelPath={cancelPath}
      />
    </HookFormPersistProvider>
  );
}
