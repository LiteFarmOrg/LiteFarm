import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureRowMethod from '../../../../components/Crop/RowMethod';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { useMemo } from 'react';
import { getRowMethodPaths } from '../../../../components/Crop/getAddManagementPlanPath';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useMatch, useParams } from 'react-router-dom-v5-compat';

export default function RowMethod() {
  let { variety_id } = useParams();
  const system = useSelector(measurementSelector);
  const crop_variety = useSelector(cropVarietySelector(variety_id));
  const persistedFormData = useSelector(hookFormPersistSelector);
  const isFinalPage = useMatch('/crop/:variety_id/add_management_plan/row_method') ? true : false;
  const { already_in_ground, needs_transplant } = persistedFormData.crop_management_plan;
  const isHistoricalPage =
    already_in_ground && ((needs_transplant && !isFinalPage) || !needs_transplant);
  const { submitPath } = useMemo(
    () => getRowMethodPaths(crop_variety.crop_variety_id, isFinalPage),
    [],
  );
  return (
    <HookFormPersistProvider>
      <PureRowMethod
        system={system}
        crop_variety={crop_variety}
        isFinalPage={isFinalPage}
        isHistoricalPage={isHistoricalPage}
        submitPath={submitPath}
      />
    </HookFormPersistProvider>
  );
}
