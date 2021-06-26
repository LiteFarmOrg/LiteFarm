import PureBedPlanGuidance from '../../../../components/Crop/BedPlan/BedPlanGuidance';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';

export default function BedPlan({ history, match }) {
  const variety_id = match.params.variety_id;
  const system = useSelector(measurementSelector);

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  };
  const onContinue = () => {
    history.push(`/crop/${variety_id}/add_management_plan/name`);
  };

  const onBack = () => {
    history.push(`/crop/${variety_id}/add_management_plan/beds`);
  };
  return (
    <PureBedPlanGuidance
      onCancel={onCancel}
      handleContinue={onContinue}
      onGoBack={onBack}
      system={system}
    />
  );
}
