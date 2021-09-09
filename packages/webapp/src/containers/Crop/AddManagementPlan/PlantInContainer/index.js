import PurePlantInContainer from '../../../../components/Crop/PlantInContainer';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { useMemo } from 'react';
import { getContainerMethodPaths } from '../../../../components/Crop/getAddManagementPlanPath';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

export default function PlantInContainer({ history, match }) {
  const system = useSelector(measurementSelector);
  const crop_variety = useSelector(cropVarietySelector(match.params.variety_id));
  const isFinalPage = match?.path === '/crop/:variety_id/add_management_plan/container_method';
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { goBackPath, submitPath, cancelPath } = useMemo(
    () => getContainerMethodPaths(match.params.variety_id, persistedFormData, isFinalPage),
    [],
  );
  return (
    <HookFormPersistProvider>
      <PurePlantInContainer
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
