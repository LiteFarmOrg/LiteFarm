import { useHistory, useParams } from 'react-router-dom';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PurePlantingOrHarvestDate from '../../../../components/Crop/PlantingDate/PurePlantingOrHarvestDate';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';
import { getLanguageFromLocalStorage } from '../../../../util/getLanguageFromLocalStorage';

export default function PlantingDate() {
  const history = useHistory();
  const { variety_id } = useParams();
  const system = useSelector(measurementSelector);
  const language_preference = getLanguageFromLocalStorage();
  const crop_variety = useSelector(cropVarietySelector(variety_id));
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
