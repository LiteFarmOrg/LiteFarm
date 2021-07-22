import PurePlanGuidance from '../../../../components/Crop/BedPlan/BedPlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

export default function RowGuidance({ history, match }) {
  const variety_id = match.params.variety_id;
  const system = useSelector(measurementSelector);

  // TODO - add path for LF-1586
  const onContinuePath = `/crop/${variety_id}/add_management_plan/name`;
  const onGoBackPath = `/crop/${variety_id}/add_management_plan/rows`;
  const persistedPaths = [onContinuePath, onGoBackPath];
  
  const persistedFormData = useSelector(hookFormPersistSelector);

  
  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  };
  const onContinue = () => {
    history.push(onContinuePath);
  };

  const onBack = () => {
    history.push(onGoBackPath);
  };
  
  return (
    <HookFormPersistProvider>
      <PurePlanGuidance
        onCancel={onCancel}
        handleContinue={onContinue}
        onGoBack={onBack}
        system={system}
        match={match}
        history={history}
        persistedPaths={persistedPaths}
        isBed={false}
      />
    </HookFormPersistProvider>
  );
}
