import PureBedPlan from '../../../../components/Crop/BedPlan/BedPlan';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PurePlantInContainer from '../../../../components/Crop/PlantInContainer';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietyByID } from '../../../cropVarietySlice';

export default function BedPlan({ history, match }) {
  const variety_id = match.params.variety_id;
  const system = useSelector(measurementSelector);
  const crop_variety = useSelector(cropVarietyByID(match.params.variety_id));

  const goBackPath = `/crop/${variety_id}/add_management_plan/planting_method`;

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  };

  const onContinue = () => {
    history.push(`/crop/${variety_id}/add_management_plan/beds_guidance`);
  };

  const onBack = () => {
    history.push(goBackPath);
  };

  return (
    <HookFormPersistProvider>
      <PureBedPlan
        onGoBack={onBack}
        onCancel={onCancel}
        handleContinue={onContinue}
        match={match}
        history={history}
        system={system}
        crop_variety={crop_variety}
      />
    </HookFormPersistProvider>
  );
}
