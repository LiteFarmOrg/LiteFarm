import PurePlanGuidance from '../../../../components/Crop/BedPlan/PurePlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useMemo } from 'react';
import { getBedGuidancePaths } from '../../../../components/Crop/getAddManagementPlanPath';
import { useMatch, useParams } from 'react-router';

export default function BedPlan({ location }) {
  let { variety_id } = useParams();
  const isFinalPage = useMatch('/crop/:variety_id/add_management_plan/bed_guidance') ? true : false;
  const system = useSelector(measurementSelector);
  const { submitPath } = useMemo(() => getBedGuidancePaths(variety_id, isFinalPage), []);
  return (
    <HookFormPersistProvider>
      <PurePlanGuidance
        system={system}
        isBed={true}
        variety_id={variety_id}
        isFinalPage={isFinalPage}
        submitPath={submitPath}
        location={location}
      />
    </HookFormPersistProvider>
  );
}
