import PurePlanGuidance from '../../../../components/Crop/BedPlan/PurePlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useMemo } from 'react';
import { getRowGuidancePaths } from '../../../../components/Crop/getAddManagementPlanPath';
import { useMatch, useParams } from 'react-router-dom';

export default function RowGuidance({ location }) {
  let { variety_id } = useParams();
  const system = useSelector(measurementSelector);
  const isFinalPage = useMatch('/crop/:variety_id/add_management_plan/row_guidance') ? true : false;
  const { submitPath } = useMemo(() => getRowGuidancePaths(variety_id, isFinalPage), []);
  return (
    <HookFormPersistProvider>
      <PurePlanGuidance
        system={system}
        isBed={false}
        isFinalPage={isFinalPage}
        variety_id={variety_id}
        submitPath={submitPath}
        location={location}
      />
    </HookFormPersistProvider>
  );
}
