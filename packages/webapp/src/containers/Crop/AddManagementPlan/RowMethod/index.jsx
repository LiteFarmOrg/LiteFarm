import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureRowMethod from '../../../../components/Crop/RowMethod';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { useMemo } from 'react';
import { useMatch, useParams } from 'react-router-dom';
import { getRowMethodPaths } from '../../../../components/Crop/getAddManagementPlanPath';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

export default function RowMethod() {
  const system = useSelector(measurementSelector);
  const { variety_id } = useParams();
  const crop_variety = useSelector(cropVarietySelector(variety_id));
  const persistedFormData = useSelector(hookFormPersistSelector);
  const isFinalPage = useMatch('/crop/:variety_id/add_management_plan/row_method');
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
