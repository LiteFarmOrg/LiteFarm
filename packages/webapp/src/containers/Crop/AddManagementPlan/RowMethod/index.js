import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureRowMethod from '../../../../components/Crop/RowMethod';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { useMemo } from 'react';
import { getRowMethodPaths } from '../../../../components/Crop/getAddManagementPlanPath';

export default function RowMethod({ history, match }) {
  const system = useSelector(measurementSelector);
  const variety_id = match.params.variety_id;
  const variety = useSelector(cropVarietySelector(variety_id));

  const isFinalPage = match.path === '/crop/:variety_id/add_management_plan/row_method';
  const { goBackPath, submitPath, cancelPath } = useMemo(
    () => getRowMethodPaths(variety.crop_variety_id, isFinalPage),
    [],
  );
  return (
    <HookFormPersistProvider>
      <PureRowMethod
        system={system}
        variety={variety}
        isFinalPage={isFinalPage}
        history={history}
        goBackPath={goBackPath}
        submitPath={submitPath}
        cancelPath={cancelPath}
      />
    </HookFormPersistProvider>
  );
}
