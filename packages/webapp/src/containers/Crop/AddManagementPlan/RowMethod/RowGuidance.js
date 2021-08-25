import PurePlanGuidance from '../../../../components/Crop/BedPlan/BedPlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

export default function RowGuidance({ history, match }) {
  const variety_id = match.params.variety_id;
  const system = useSelector(measurementSelector);
  const isFinalPage = match?.path === '/crop/:variety_id/add_management_plan/row_guidance';

  return (
    <HookFormPersistProvider>
      <PurePlanGuidance
        system={system}
        history={history}
        isBed={false}
        isFinalPage={isFinalPage}
        variety_id={variety_id}
      />
    </HookFormPersistProvider>
  );
}
