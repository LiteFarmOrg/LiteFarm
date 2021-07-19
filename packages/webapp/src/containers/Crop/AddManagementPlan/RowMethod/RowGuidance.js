import PurePlanGuidance from '../../../../components/Crop/BedPlan/BedPlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

export default function RowGuidance({ history, match }) {
  const variety_id = match.params.variety_id;
  const system = useSelector(measurementSelector);
  const onContinuePath = `/crop/${variety_id}/add_management_plan/name`;
  const onGoBackPath = `/crop/${variety_id}/add_management_plan/rows`;
  const persistedPaths = [onContinuePath, onGoBackPath];

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
