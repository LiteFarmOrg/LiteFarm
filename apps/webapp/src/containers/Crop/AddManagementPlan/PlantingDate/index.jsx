import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PurePlantingOrHarvestDate from '../../../../components/Crop/PlantingDate/PurePlantingOrHarvestDate';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { getLanguageFromLocalStorage } from '../../../../util/getLanguageFromLocalStorage';

export default function PlantingDate({ history, match }) {
  const system = useSelector(measurementSelector);
  const language_preference = getLanguageFromLocalStorage();
  const crop_variety = useSelector(cropVarietySelector(match?.params?.variety_id));
  return (
    <HookFormPersistProvider>
      <PurePlantingOrHarvestDate
        system={system}
        crop_variety={crop_variety}
        history={history}
        language={language_preference}
      />
    </HookFormPersistProvider>
  );
}
