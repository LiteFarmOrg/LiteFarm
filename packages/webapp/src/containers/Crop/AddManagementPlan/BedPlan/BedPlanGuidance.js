import PurePlanGuidance from '../../../../components/Crop/BedPlan/BedPlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

export default function BedPlan({ history, match }) {
  const variety_id = match.params.variety_id;
  const system = useSelector(measurementSelector);
  const isFinalPage = match?.path.includes('final');

  return (
    <HookFormPersistProvider>
      <PurePlanGuidance
        system={system}
        history={history}
        isBed={true}
        variety_id={variety_id}
        isFinalPage={isFinalPage}
      />
    </HookFormPersistProvider>
  );
}
