import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureRowMethod from '../../../../components/Crop/RowMethod';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';

export default function RowMethod({ history, match }) {
  const system = useSelector(measurementSelector);
  const variety_id = match.params.variety_id;
  const variety = useSelector(cropVarietySelector(variety_id));

  const continuePath = `/crop/${variety_id}/add_management_plan/row_guidance`;
  const goBackPath = `/crop/${variety_id}/add_management_plan/final_planting_method`;

  const persistPath = [goBackPath, continuePath];

  const onGoBack = () => {
    history.push(goBackPath);
  };

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  const onContinue = () => {
    history.push(continuePath);
  };

  return (
    <HookFormPersistProvider>
      <PureRowMethod
        system={system}
        onGoBack={onGoBack}
        onCancel={onCancel}
        onContinue={onContinue}
        persistPath={persistPath}
        variety={variety}
      />
    </HookFormPersistProvider>
  );
}
