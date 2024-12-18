import PureBedPlan from '../../../../components/Crop/BedPlan/PureBedPlan';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { useMemo } from 'react';
import { getBedMethodPaths } from '../../../../components/Crop/getAddManagementPlanPath';
import { useMatch, useParams } from 'react-router';

export default function BedPlan({ location }) {
  let { variety_id } = useParams();
  const system = useSelector(measurementSelector);
  const crop_variety = useSelector(cropVarietySelector(variety_id));
  const isFinalPage = useMatch('/crop/:variety_id/add_management_plan/bed_method') ? true : false;
  const { submitPath } = useMemo(
    () => getBedMethodPaths(crop_variety.crop_variety_id, isFinalPage),
    [],
  );
  return (
    <HookFormPersistProvider>
      <PureBedPlan
        system={system}
        crop_variety={crop_variety}
        isFinalPage={isFinalPage}
        submitPath={submitPath}
        location={location}
      />
    </HookFormPersistProvider>
  );
}
